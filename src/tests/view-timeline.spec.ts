import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { StubDateProvider } from "./posting-message.spec";

export const aliceMessage1: Message = {
  id: "message-id-1",
  author: "Alice",
  text: "My first message",
  publishedAt: new Date("2023-02-07T19:00:00.000Z"),
};

export const aliceMessage2: Message = {
  id: "message-id-2",
  author: "Alice",
  text: "My second message",
  publishedAt: new Date("2023-02-07T19:30:00.000Z"),
};

const bobMessage1: Message = {
  id: "message-id-3",
  author: "Bob",
  text: "My First message",
  publishedAt: new Date("2023-02-07T18:00:00.000Z"),
};

describe("Feature: Viewing a personal timeline", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view 2 messages she have published in her timeline", async () => {
      fixture.givenTheFollowingMessagesExist([aliceMessage1, aliceMessage2, bobMessage1]);
      fixture.givenNowIs(new Date("2023-02-07T19:31:00.000Z"));

      await fixture.whenUserSeesTheTimelineOf({
        author: "Alice",
      });

      fixture.thenUserShouldSee([
        {
          author: aliceMessage2.author,
          text: aliceMessage2.text,
          publicationTime: "1 minute ago",
        },
        {
          author: aliceMessage1.author,
          text: aliceMessage1.text,
          publicationTime: "31 minute ago",
        },
      ]);
    });
  });
});

const createFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);

  let timeline: { author: string; text: string; publicationTime: string }[] = [];

  return {
    givenNowIs: (now: Date) => {
      dateProvider.now = now;
    },
    givenTheFollowingMessagesExist: (messages: Message[]) => {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserSeesTheTimelineOf(timelineQuery: { author: string }) {
      timeline = await viewTimelineUseCase.handle({
        author: timelineQuery.author,
      });
    },
    thenUserShouldSee: (expectedTimeline: { author: string; text: string; publicationTime: string }[]) => {
      expect(timeline).toEqual(expectedTimeline);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
