import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import * as httpErrors from "http-errors";
import { DateProvider } from "../../src/application/date.provider";
import { EditMessageCommand, EditMessageUseCase } from "../../src/application/usecases/edit-message.usecase";
import { FollowUserCommand, FollowUserUseCase } from "../../src/application/usecases/follow-user.usecase";
import { PostMessageCommand, PostMessageUseCase } from "../../src/application/usecases/post-message.usecase";
import { ViewTimelineCommand, ViewTimelineUseCase } from "../../src/application/usecases/view-timeline.usecase";
import { ViewWallCommand, ViewWallUseCase } from "../../src/application/usecases/view-wall.usecase";
import { PrismaFollowsRepository } from "./../infra/follow.prisma.repository";
import { PrismaMessageRepository } from "./../infra/message.prisma.repository";
import { TimelinePresenter } from "../application/timeline.presenter";
import { Timeline } from "../domain/timeline";

class ApiTimeLinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}
  show(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const dateProvider = new RealDateProvider();

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followsRepository = new PrismaFollowsRepository(prismaClient);

const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const followUserUseCase = new FollowUserUseCase(followsRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followsRepository);

const fastify = Fastify({
  logger: true,
});

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; text: string } }>("/post-message", {}, async (request, reply) => {
    const { user, text } = request.body;
    const postMessageCommand: PostMessageCommand = {
      id: randomUUID(),
      author: user,
      text,
    };
    try {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isOk()) {
        reply.status(201);
        return;
      }
      reply.send(httpErrors[403](result.error));
    } catch (error) {
      console.error("❌ Failed to post message", error);
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.post<{ Body: EditMessageCommand }>("/edit-message", {}, async (request, reply) => {
    const { messageId, text } = request.body;
    const editMessageCommand: EditMessageCommand = {
      messageId,
      text,
    };
    try {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isOk()) {
        reply.status(200);
        return;
      }
      reply.send(httpErrors[403](result.error));
    } catch (error) {
      console.error("❌ Failed to edit message", error);
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.get<{ Querystring: { user: string } }>("/view-timeline", {}, async (request, reply) => {
    const { user } = request.query;
    const viewTimelineCommand: ViewTimelineCommand = {
      author: user,
    };
    const apiTimeLinePresenter = new ApiTimeLinePresenter(reply);
    try {
      await viewTimelineUseCase.handle(viewTimelineCommand, apiTimeLinePresenter);
    } catch (error) {
      console.error("❌ Failed to display timeline", error);
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.get<{ Querystring: { user: string } }>("/view-wall", {}, async (request, reply) => {
    const { user } = request.query;
    const viewWallCommand: ViewWallCommand = {
      author: user,
    };
    const apiTimeLinePresenter = new ApiTimeLinePresenter(reply);

    try {
      await viewWallUseCase.handle(viewWallCommand, apiTimeLinePresenter);
    } catch (error) {
      console.error("❌ Failed to display wall", error);
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.post<{ Body: FollowUserCommand }>("/follow-user", {}, async (request, reply) => {
    const { user, userToFollow } = request.body;
    const followUserCommand: FollowUserCommand = {
      user,
      userToFollow,
    };
    try {
      await followUserUseCase.handle(followUserCommand);
      reply.status(201);
    } catch (error) {
      console.error("❌ Failed to follow user", error);
      reply.send(httpErrors[500](error));
    }
  });
};

fastify.register(routes);

fastify.addHook("onClose", async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    prismaClient.$disconnect();
    process.exit(1);
  }
}

main();
