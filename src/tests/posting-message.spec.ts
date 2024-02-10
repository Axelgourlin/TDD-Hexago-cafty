import { EmptyMessageError, MessageTooLongError } from "../post-message.usecase";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Posting a message", () => {
  let fixture: MessagingFixture;
  const aliceMessageBuilder = messageBuilder().withId("message-id").withAuthor("Alice");

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText("Hello World").build());

      fixture.thenMessageShouldBe(
        aliceMessageBuilder.withText("Hello World").withPublishedAt(new Date("2023-01-19T19:00:00.000Z")).build()
      );
    });

    test("Alice cannot post a message longer than 280 characters", async () => {
      const textWith281Chars = "a".repeat(281);

      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText(textWith281Chars).build());

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Alice cannot post a message with an empty text", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText("").build());

      fixture.thenErrorShouldBe(EmptyMessageError);
    });

    test("Alice cannot post a message with only spaces", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText(" ").build());

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
