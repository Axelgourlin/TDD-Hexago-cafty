import { DateProvider } from '@crafty/crafty/application/date.provider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/message.prisma.repository';
import { StubDateProvider } from '@crafty/crafty/infra/stub-date.provider';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { CommandTestFactory } from 'nest-commander-testing';
import { promisify } from 'util';
import { CliModule } from '../src/cli.module';

const asyncExec = promisify(exec);

describe('Cli App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;

  const now = new Date('2023-01-19T19:00:00.000Z');
  const dateProvider = new StubDateProvider();
  dateProvider.now = now;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-e2e')
      .withUsername('crafty-e2e')
      .withPassword('crafty-e2e')
      .withExposedPorts(5432)
      .start();

    const dataBaseUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}?schema=public`;

    prismaClient = new PrismaClient({
      datasourceUrl: dataBaseUrl,
    });

    await asyncExec(`DATABASE_URL=${dataBaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  beforeEach(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });

    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [CliModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe(`DELETE FROM "User" CASCADE`);
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('post command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await CommandTestFactory.run(commandInstance, [
      'post',
      'Alice',
      'Message from test',
    ]);

    const aliceMessages = await messageRepository.getAllByAuthor('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from test',
      publishedAt: now,
    });
  });

  test('view command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable);

    await messageRepository.save(
      messageBuilder()
        .withAuthor('Alice')
        .withText('Message test view command')
        .withPublishedAt(now)
        .build(),
    );

    await CommandTestFactory.run(commandInstance, ['view', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith([
      {
        author: 'Alice',
        publicationTime: 'less than a minute ago',
        text: 'Message test view command',
      },
    ]);
  });
});
