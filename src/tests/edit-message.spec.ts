import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Editing a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: The edited text should not be superior to 280 characters", () => {
    test("Alice can edit her message to a text inferior to 280 characters", async () => {
      fixture.givenTheFollowingMessagesExist([
        messageBuilder({
          id: "message-id",
          author: "Alice",
          text: "Hello Wrold",
        }),
      ]);

      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "Hello World",
      });

      fixture.thenMessageShouldBe(
        messageBuilder({
          id: "message-id",
          author: "Alice",
          text: "Hello World",
        })
      );
    });
  });
});
