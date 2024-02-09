#!/usr/bin/env node
import { ViewTimelineCommand, ViewTimelineUseCase } from "./src/view-timeline.usecase";
import { DateProvider, PostMessageCommand, PostMessageUseCase } from "./src/post-message.usecase";
import { Command } from "commander";
import { FileSystemMessageRepository } from "./src/message.fs.repository";
import { randomUUID } from "crypto";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const dateProvider = new RealDateProvider();
const messageRepository = new FileSystemMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);

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

program
  .version("1.0.0")
  .description("Crafty social network")
  .addCommand(postMessageCommand)
  .addCommand(viewTimelineCommand);

async function main() {
  await program.parseAsync();
}

main();
