#!/usr/bin/env node
import { Command } from "commander";
import { randomUUID } from "crypto";
import { DateProvider } from "./src/application/date.provider";
import { EditMessageCommand, EditMessageUseCase } from "./src/application/usecases/edit-message.usecase";
import { FollowUserCommand, FollowUserUseCase } from "./src/application/usecases/follow-user.usecase";
import { PostMessageCommand, PostMessageUseCase } from "./src/application/usecases/post-message.usecase";
import { ViewTimelineCommand, ViewTimelineUseCase } from "./src/application/usecases/view-timeline.usecase";
import { ViewWallCommand, ViewWallUseCase } from "./src/application/usecases/view-wall.usecase";
import { FileSystemFollowRepository } from "./src/infra/follow.fs.repository";
import { FileSystemMessageRepository } from "./src/infra/message.fs.repository";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const dateProvider = new RealDateProvider();
const messageRepository = new FileSystemMessageRepository();
const followsRepository = new FileSystemFollowRepository();

const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const followUserUseCase = new FollowUserUseCase(followsRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followsRepository, dateProvider);

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
      await postMessageUseCase.handle(postMessageCommand);
      console.log("✅ Message posted");
      process.exit(0);
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
      await editMessageUseCase.handle(editMessageCommand);
      console.log("✅ Message edited");
      process.exit(0);
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
    const timeline = await viewTimelineUseCase.handle(viewTimelineCommand);
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
    const wall = await viewWallUseCase.handle(viewWallCommand);
    console.log(wall);
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
  await program.parseAsync();
}

main();
