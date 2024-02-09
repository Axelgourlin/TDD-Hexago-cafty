import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { PostMessageUseCase, PostMessageCommand } from "../post-message.usecase";
import { StubDateProvider } from "../stub-date-provider";
import { ViewTimelineUseCase } from "../view-timeline.usecase";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);

  let throwError: Error;
  let timeline: { author: string; text: string; publicationTime: string }[] = [];

  return {
    givenNowIs(now: Date) {
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
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (error) {
        throwError = error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: { messageId: string; text: string }) {},
    thenUserShouldSee: (expectedTimeline: { author: string; text: string; publicationTime: string }[]) => {
      expect(timeline).toEqual(expectedTimeline);
    },
    thenMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(messageRepository.getMessageById(expectedMessage.id));
    },

    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedErrorClass);
    },
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
