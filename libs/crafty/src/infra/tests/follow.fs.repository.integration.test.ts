import * as fs from 'fs';
import * as path from 'path';
import { FileSystemFollowRepository } from '../follow.fs.repository';
import { Follow } from './../../application/follows.repository';

const testMessagePath = path.join(__dirname, 'follow-test.json');

describe('FileSystemFollowRepository', () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagePath, JSON.stringify({}));
  });

  test('saveFollow() should save a new follow when there was not follows before', async () => {
    const followsRepository = new FileSystemFollowRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify({
        Bob: ['Alice'],
      }),
    );

    const follow: Follow = {
      user: 'Alice',
      follow: 'Charlie',
    };

    await followsRepository.saveFollow(follow);

    const followData = await fs.promises.readFile(testMessagePath);
    const followJSON = JSON.parse(followData.toString()) as {
      [user: string]: string[];
    };
    expect(followJSON).toEqual({
      Alice: ['Charlie'],
      Bob: ['Alice'],
    });
  });

  test('saveFollow() should save a new follow', async () => {
    const followsRepository = new FileSystemFollowRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify({
        Alice: ['Bob'],
        Bob: ['Charlie'],
      }),
    );

    const follow: Follow = {
      user: 'Alice',
      follow: 'Charlie',
    };

    await followsRepository.saveFollow(follow);

    const followData = await fs.promises.readFile(testMessagePath);
    const followJSON = JSON.parse(followData.toString()) as {
      [user: string]: string[];
    };
    expect(followJSON).toEqual({
      Alice: ['Bob', 'Charlie'],
      Bob: ['Charlie'],
    });
  });

  test('getFollowsOf() can get follows', async () => {
    const followsRepository = new FileSystemFollowRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify({
        Bob: ['Alice'],
        Alice: ['Bob', 'Charlie'],
      }),
    );

    const [aliceFollows, bobFollows] = await Promise.all([
      followsRepository.getFollowsOf('Alice'),
      followsRepository.getFollowsOf('Bob'),
    ]);

    expect(aliceFollows).toEqual(['Bob', 'Charlie']);
    expect(bobFollows).toEqual(['Alice']);
  });

  test('getFollowsOf() should return undefined when get a follows that user does not exist', async () => {
    const followsRepository = new FileSystemFollowRepository(testMessagePath);
    const follows = await followsRepository.getFollowsOf('Alice');
    expect(follows).toBeUndefined();
  });
});
