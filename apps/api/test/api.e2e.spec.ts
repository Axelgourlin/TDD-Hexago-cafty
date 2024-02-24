import { DateProvider } from '@crafty/crafty/application/date.provider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/message.prisma.repository';
import { StubDateProvider } from '@crafty/crafty/infra/stub-date.provider';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import * as request from 'supertest';
import { promisify } from 'util';
import { ApiModule } from '../src/api.module';

const asyncExec = promisify(exec);

describe('Api App (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe(`DELETE FROM "User" CASCADE`);
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('/post-message (POST)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await request(app.getHttpServer())
      .post('/post-message')
      .send({
        user: 'Alice',
        text: 'Message test post api',
      })
      .expect(201);

    const aliceMessage = await messageRepository.getAllByAuthor('Alice');
    expect(aliceMessage[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message test post api',
      publishedAt: now,
    });
  });

  test('/view-timeline (GET)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withAuthor('Alice')
        .withText('Message test view api')
        .withPublishedAt(now)
        .build(),
    );

    await request(app.getHttpServer())
      .get('/view-timeline')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          {
            id: expect.any(String),
            author: 'Alice',
            text: 'Message test view api',
            publishedAt: now.toISOString(),
          },
        ]);
      });
  });
});
