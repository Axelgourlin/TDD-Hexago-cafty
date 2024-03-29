import {
  PostMessageCommand,
  PostMessageUseCase,
} from './../application/usecases/post-message.usecase';
import { Message } from '../domain/message';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { EditMessageUseCase } from '../application/usecases/edit-message.usecase';
import { InMemoryMessageRepository } from '../infra/message.inmemory.repository';
import { StubDateProvider } from '../infra/stub-date.provider';
import { DefaultTimelinePresenter } from '../../../../apps/cli/src/default.timeline.presenter';
import { TimelinePresenter } from '../application/timeline.presenter';

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();

  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider,
  );
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  const editMessageUseCase = new EditMessageUseCase(messageRepository);

  const defaultTimeLinePresenter = new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    show(timeLine) {
      timeline = defaultTimeLinePresenter.show(timeLine);
    },
  };

  let throwError: Error;
  let timeline: { author: string; text: string; publicationTime: string }[] =
    [];

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserSeesTheTimelineOf(timelineQuery: { author: string }) {
      await viewTimelineUseCase.handle(
        {
          author: timelineQuery.author,
        },
        timelinePresenter,
      );
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        throwError = result.error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: {
      messageId: string;
      text: string;
    }) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        throwError = result.error;
      }
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },

    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedErrorClass);
    },
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
