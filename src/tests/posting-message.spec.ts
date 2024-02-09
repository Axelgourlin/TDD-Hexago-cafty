import { EmptyMessageError, MessageTooLongError } from "../post-message.usecase";
import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Posting a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });

      fixture.thenMessageShouldBe({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });

    test("Alice cannot post a message longer than 280 characters", async () => {
      const textWith281Chars = "a".repeat(281);

      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: textWith281Chars,
        author: "Alice",
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Alice cannot post a message with an empty text", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "",
        author: "Alice",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });

    test("Alice cannot post a message with only spaces", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "  ",
        author: "Alice",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
