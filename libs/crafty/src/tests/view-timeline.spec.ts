import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Viewing a personal timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view 2 messages she have published in her timeline", async () => {
      const aliceMessageBuilder = messageBuilder().withAuthor("Alice");
      fixture.givenTheFollowingMessagesExist([
        aliceMessageBuilder
          .withId("message-id-1")
          .withText("My first message")
          .withPublishedAt(new Date("2023-02-07T19:00:00.000Z"))
          .build(),
        messageBuilder()
          .withId("message-id-2")
          .withAuthor("Bob")
          .withText("My First message")
          .withPublishedAt(new Date("2023-02-07T18:00:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-id-3")
          .withText("My second message")
          .withPublishedAt(new Date("2023-02-07T19:30:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-id-4")
          .withText("My last message")
          .withPublishedAt(new Date("2023-02-07T19:30:30.000Z"))
          .build(),
      ]);

      fixture.givenNowIs(new Date("2023-02-07T19:31:00.000Z"));

      await fixture.whenUserSeesTheTimelineOf({
        author: "Alice",
      });

      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "My last message",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "My second message",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "31 minutes ago",
        },
      ]);
    });
  });
});
