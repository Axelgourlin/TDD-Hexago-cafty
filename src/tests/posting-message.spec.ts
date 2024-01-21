import {
  DateProvider,
  EmptyMessageError,
  Message,
  MessageRepository,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";

describe("Feature: Posting a message", () => {
  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      whenUserPostsAMessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });

      thenPostedMessageShouldBe({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });

    test("Alice cannot post a message longer than 280 characters", () => {
      const textWith281Chars = "a".repeat(281);

      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      whenUserPostsAMessage({
        id: "message-id",
        text: textWith281Chars,
        author: "Alice",
      });

      thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Alice cannot post a message with an empty text", () => {
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      whenUserPostsAMessage({
        id: "message-id",
        text: "",
        author: "Alice",
      });

      thenErrorShouldBe(EmptyMessageError);
    });
  });
});

let message: Message;
let throwError: Error;

class InMemoryMessageRepository implements MessageRepository {
  save(msg: Message): void {
    message = msg;
  }
}

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();

const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);

function givenNowIs(_now: Date) {
  dateProvider.now = _now;
}

function whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
  try {
    postMessageUseCase.handle(postMessageCommand);
  } catch (error) {
    throwError = error;
  }
}

function thenPostedMessageShouldBe(expectedMessage: Message) {
  expect(expectedMessage).toEqual(message);
}

function thenErrorShouldBe(expectedErrorClass: new () => Error) {
  expect(throwError).toBeInstanceOf(expectedErrorClass);
}
