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
  });
});

function givenNowIs(now: Date) {}

function whenUserPostsAMessage(postMessageCommand: { id: string; text: string; author: string }) {}

function thenPostedMessageShouldBe(expectedMessage: { id: string; text: string; author: string; publishedAt: Date }) {}
