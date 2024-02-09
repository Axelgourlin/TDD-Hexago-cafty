import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Viewing a personal timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view 2 messages she have published in her timeline", async () => {
      fixture.givenTheFollowingMessagesExist([
        {
          id: "message-id-1",
          author: "Alice",
          text: "My first message",
          publishedAt: new Date("2023-02-07T19:00:00.000Z"),
        },
        {
          id: "message-id-2",
          author: "Alice",
          text: "My second message",
          publishedAt: new Date("2023-02-07T19:30:00.000Z"),
        },
        {
          id: "message-id-",
          author: "Alice",
          text: "My last message",
          publishedAt: new Date("2023-02-07T19:30:30.000Z"),
        },
        {
          id: "message-id-3",
          author: "Bob",
          text: "My First message",
          publishedAt: new Date("2023-02-07T18:00:00.000Z"),
        },
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
