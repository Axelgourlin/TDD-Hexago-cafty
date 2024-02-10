import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging-fixture";

describe("Feature: Editing a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: The edited text should not be superior to 280 characters", () => {
    test("Alice can edit her message to a text inferior to 280 characters", async () => {
      const aliceMessageBuilder = messageBuilder().withId("message-id").withAuthor("Alice");

      fixture.givenTheFollowingMessagesExist([aliceMessageBuilder.withText("Hello Wrold").build()]);

      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "Hello World",
      });

      fixture.thenMessageShouldBe(aliceMessageBuilder.withText("Hello World").build());
    });
  });
});
