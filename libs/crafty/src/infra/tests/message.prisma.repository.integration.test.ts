import { messageBuilder } from './../../tests/message.builder';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaMessageRepository } from '../message.prisma.repository';

const asyncExec = promisify(exec);

describe('PrismaMessageRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-test')
      .withUsername('crafty-test')
      .withPassword('crafty-test')
      .withExposedPorts(5432)
      .start();

    const dataBaseUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}?schema=public`;

    prismaClient = new PrismaClient({
      datasourceUrl: dataBaseUrl,
    });

    await asyncExec(`DATABASE_URL=${dataBaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  }, 10000);

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe(`DELETE FROM "User" CASCADE`);
  });

  test('save() should save a new message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messageId = 'message-id-1';
    const messageAuthor = 'Alice';
    const messageText = 'Hello World';
    const messagePublishedAt = new Date('2023-01-19T19:00:00.000Z');

    const message = messageBuilder()
      .withId(messageId)
      .withAuthor(messageAuthor)
      .withText(messageText)
      .withPublishedAt(messagePublishedAt)
      .build();

    await messageRepository.save(message);

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: messageId,
      },
    });

    expect(expectedMessage).toEqual({
      id: messageId,
      authorId: messageAuthor,
      text: messageText,
      publishedAt: messagePublishedAt,
    });
  });

  test('save() should save an existing message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messageId = 'message-id-1';
    const messageAuthor = 'Alice';
    const messageText = 'Hello World';
    const messageEditedText = 'Edited message';
    const messagePublishedAt = new Date('2023-01-19T19:00:00.000Z');

    const aliceMessageBuilder = messageBuilder()
      .withId(messageId)
      .withAuthor(messageAuthor)
      .withText(messageText)
      .withPublishedAt(messagePublishedAt);

    await messageRepository.save(aliceMessageBuilder.build());

    await messageRepository.save(
      aliceMessageBuilder.withText(messageEditedText).build(),
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: messageId,
      },
    });

    expect(expectedMessage).toEqual({
      id: messageId,
      authorId: messageAuthor,
      text: messageEditedText,
      publishedAt: messagePublishedAt,
    });
  });

  test('getById() should get a message by its id', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messageId = 'message-id-1';

    const aliceMessage = messageBuilder()
      .withId(messageId)
      .withAuthor('Alice')
      .withText('Hello World')
      .withPublishedAt(new Date('2023-01-19T19:00:00.000Z'))
      .build();

    await messageRepository.save(aliceMessage);

    const expectedMessage = await messageRepository.getById(messageId);

    expect(expectedMessage).toEqual(aliceMessage);
  });

  test('getAllOfUser() should get all user messages', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messageId = 'message-id-1';
    const messageId2 = 'message-id-2';
    const messageId3 = 'message-id-3';

    const aliceMessage = messageBuilder()
      .withId(messageId)
      .withAuthor('Alice')
      .withText('Alice message 1')
      .withPublishedAt(new Date('2023-01-19T19:00:00.000Z'))
      .build();

    const aliceMessage2 = messageBuilder()
      .withId(messageId2)
      .withAuthor('Alice')
      .withText('Alice message 2')
      .withPublishedAt(new Date('2023-01-19T19:00:00.000Z'))
      .build();

    const bobMessage = messageBuilder()
      .withId(messageId3)
      .withAuthor('Bob')
      .withText('Bob message 1')
      .withPublishedAt(new Date('2023-01-19T19:00:00.000Z'))
      .build();

    await Promise.all(
      [aliceMessage, aliceMessage2, bobMessage].map((message) =>
        messageRepository.save(message),
      ),
    );

    const expectedMessages = await messageRepository.getAllByAuthor('Alice');
    expect(expectedMessages).toHaveLength(2);
    expect(expectedMessages).toEqual(
      expect.arrayContaining([aliceMessage, aliceMessage2]),
    );
  });
});
