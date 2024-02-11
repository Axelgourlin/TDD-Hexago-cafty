import { messageBuilder } from "./message.builder";
import * as path from "path";
import * as fs from "fs";
import { FileSystemMessageRepository } from "../infra/message.fs.repository";

const testMessagePath = path.join(__dirname, "message-test.json");

describe("FileSystemMessageRepository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
  });
  test("save() can save a message", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await messageRepository.save(
      messageBuilder()
        .withId("message-id-1")
        .withAuthor("Alice")
        .withText("Hello World")
        .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build()
    );

    const messageData = await fs.promises.readFile(testMessagePath);
    const messageJSON = JSON.parse(messageData.toString());
    expect(messageJSON).toEqual([
      {
        id: "message-id-1",
        author: "Alice",
        text: "Hello World",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });

  test("save() can update an existing message", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-id-1",
          author: "Alice",
          text: "Hello world",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ])
    );

    await messageRepository.save(
      messageBuilder()
        .withId("message-id-1")
        .withAuthor("Alice")
        .withText("Edited message")
        .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build()
    );

    const messageData = await fs.promises.readFile(testMessagePath);
    const messageJSON = JSON.parse(messageData.toString());
    expect(messageJSON).toEqual([
      {
        id: "message-id-1",
        author: "Alice",
        text: "Edited message",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });

  test("getById() can get a message by its id", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-id-1",
          author: "Alice",
          text: "Hello World",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-id-2",
          author: "Bob",
          text: "Hello from Bob",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ])
    );

    const message = await messageRepository.getById("message-id-1");

    expect(message).toEqual(
      messageBuilder()
        .withId("message-id-1")
        .withAuthor("Alice")
        .withText("Hello World")
        .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build()
    );
  });

  test("getAllByAuthor() can get all messages of a specific user", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-id-1",
          author: "Alice",
          text: "Hello World",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-id-2",
          author: "Bob",
          text: "Hello from Bob",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-id-3",
          author: "Alice",
          text: "second message",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ])
    );

    const messages = await messageRepository.getAllByAuthor("Alice");

    expect(messages).toHaveLength(2);
    expect(messages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId("message-id-1")
          .withAuthor("Alice")
          .withText("Hello World")
          .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
          .build(),
        messageBuilder()
          .withId("message-id-3")
          .withAuthor("Alice")
          .withText("second message")
          .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
          .build(),
      ])
    );
  });
});
