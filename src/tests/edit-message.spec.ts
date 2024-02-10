import { MessageTooLongError, EmptyMessageError } from "../message";
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

      await fixture.thenMessageShouldBe(aliceMessageBuilder.withText("Hello World").build());
    });
  });

  test("Alice cannot edit her message to a text superior to 280 characters", async () => {
    const textWith281Chars = "a".repeat(281);
    const originalAliceMessage = messageBuilder()
      .withId("message-id")
      .withAuthor("Alice")
      .withText("Hello World")
      .build();

    fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

    await fixture.whenUserEditsMessage({
      messageId: "message-id",
      text: textWith281Chars,
    });

    await fixture.thenMessageShouldBe(originalAliceMessage);
    fixture.thenErrorShouldBe(MessageTooLongError);
  });

  test("Alice cannot edit her message to and empty text", async () => {
    const originalAliceMessage = messageBuilder()
      .withId("message-id")
      .withAuthor("Alice")
      .withText("Hello World")
      .build();

    fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

    await fixture.whenUserEditsMessage({
      messageId: "message-id",
      text: "",
    });

    await fixture.thenMessageShouldBe(originalAliceMessage);
    fixture.thenErrorShouldBe(EmptyMessageError);
  });

  test("Alice cannot edit her message to and empty text", async () => {
    const originalAliceMessage = messageBuilder()
      .withId("message-id")
      .withAuthor("Alice")
      .withText("Hello World")
      .build();

    fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

    await fixture.whenUserEditsMessage({
      messageId: "message-id",
      text: " ",
    });

    await fixture.thenMessageShouldBe(originalAliceMessage);
    fixture.thenErrorShouldBe(EmptyMessageError);
  });
});
