import { EditMessageUseCase } from "../edit-message.usecase";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";
import { StubDateProvider } from "../stub-date-provider";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { Message } from "./../message";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();

  const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
  const editMessageUseCase = new EditMessageUseCase(messageRepository);

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
    async whenUserEditsMessage(editMessageCommand: { messageId: string; text: string }) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
      } catch (error) {
        throwError = error;
      }
    },
    thenUserShouldSee: (expectedTimeline: { author: string; text: string; publicationTime: string }[]) => {
      expect(timeline).toEqual(expectedTimeline);
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },

    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedErrorClass);
    },
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
