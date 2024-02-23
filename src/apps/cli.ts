#!/usr/bin/env node
import { DefaultTimelinePresenter } from "./timeline.default.presenter";
import { PrismaClient } from "@prisma/client";
import { Command } from "commander";
import { randomUUID } from "crypto";
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
import { EmptyMessageError, MessageTooLongError } from "../domain/message";

class CliTimeLinePresenter implements TimelinePresenter {
  constructor(private readonly defaultTimelinePresenter: DefaultTimelinePresenter) {}

  show(timeline: Timeline): void {
    console.table(this.defaultTimelinePresenter.show(timeline));
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

const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const cliTimelinePresenter = new CliTimeLinePresenter(defaultTimelinePresenter);

const program = new Command();

const postMessageCommand = new Command("post")
  .argument("<user>", "the current user")
  .argument("<message>", "the message to post")
  .action(async (user, message) => {
    const postMessageCommand: PostMessageCommand = {
      id: randomUUID(),
      author: user,
      text: message,
    };
    try {
      const result = await postMessageUseCase.handle(postMessageCommand);

      if (result.isOk()) {
        console.log("✅ Message posted");
        process.exit(0);
      }

      console.error("❌ Failed to post message", result.error);
      process.exit(1);
    } catch (error) {
      console.error("❌ Failed to post message", error);
      process.exit(1);
    }
  });

const editMessageCommand = new Command("edit")
  .argument("<message-id>", "the message id to the message to edit")
  .argument("<message>", "the new text")
  .action(async (messageId, message) => {
    const editMessageCommand: EditMessageCommand = {
      messageId,
      text: message,
    };
    try {
      const result = await editMessageUseCase.handle(editMessageCommand);

      if (result.isOk()) {
        console.log("✅ Message edited");
        process.exit(0);
      }

      console.error("❌ Failed to edit message", result.error);
      process.exit(1);
    } catch (error) {
      console.error("❌ Failed to edit message", error);
      process.exit(1);
    }
  });

const viewTimelineCommand = new Command("view").argument("<user>", "the current user").action(async (user) => {
  const viewTimelineCommand: ViewTimelineCommand = {
    author: user,
  };
  try {
    const timeline = await viewTimelineUseCase.handle(viewTimelineCommand, cliTimelinePresenter);
    console.table(timeline);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to display timeline", error);
    process.exit(1);
  }
});

const followUserCommand = new Command("follow")
  .argument("<user>", "the current user")
  .argument("<user-to-follow>", "the user to follow")
  .action(async (user, userToFollow) => {
    const followUserCommand: FollowUserCommand = {
      user,
      userToFollow,
    };
    try {
      await followUserUseCase.handle(followUserCommand);
      console.log(`✅ ${userToFollow} is now followed`);
      process.exit(0);
    } catch (error) {
      console.error("❌ Failed to follow user", error);
      process.exit(1);
    }
  });

const viewWallCommand = new Command("wall").argument("<user>", "the current user").action(async (user) => {
  const viewWallCommand: ViewWallCommand = {
    author: user,
  };
  try {
    const wall = await viewWallUseCase.handle(viewWallCommand, cliTimelinePresenter);
    console.table(wall);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to display wall", error);
    process.exit(1);
  }
});

program
  .version("1.0.0")
  .description("Crafty social network")
  .addCommand(postMessageCommand)
  .addCommand(editMessageCommand)
  .addCommand(viewTimelineCommand)
  .addCommand(followUserCommand)
  .addCommand(viewWallCommand);

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
