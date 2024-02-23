import { MessageRepository } from './../application/message.repository';
import { ViewWallUseCase } from '../application/usecases/view-wall.usecase';
import { StubDateProvider } from '../infra/stub-date.provider';
import { FollowingFixture, createFollowingFixture } from './following.fixture';
import { messageBuilder } from './message.builder';
import { MessagingFixture, createMessagingFixture } from './messaging-fixture';
import { FollowsRepository } from '../application/follows.repository';
import { DefaultTimelinePresenter } from '../../../../apps/cli/src/default.timeline.presenter';
import { TimelinePresenter } from '../application/timeline.presenter';

describe('Feature: Viewing user wall', () => {
  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followingFixture: FollowingFixture;

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followingFixture = createFollowingFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followsRepository: followingFixture.followsRepository,
    });
  });

  describe('Rule: All the messages from the user and her followers should appear in reverse chronological order', () => {
    test("Charlie has subscribed to Alice's and Bob's timelines, and thus can view an aggregated list of all subscriptions", async () => {
      fixture.givenNowIs(new Date('2023-01-19T18:15:30.000Z'));

      messagingFixture.givenTheFollowingMessagesExist([
        messageBuilder()
          .withAuthor('Alice')
          .withText('Alice message')
          .withPublishedAt(new Date('2023-01-19T18:00:30.000Z'))
          .build(),
        messageBuilder()
          .withId('massage-id-2')
          .withAuthor('Bob')
          .withText('Bob message')
          .withPublishedAt(new Date('2023-01-19T18:01:00.000Z'))
          .build(),
        messageBuilder()
          .withId('message-id-3')
          .withAuthor('Charlie')
          .withText('Charlie message')
          .withPublishedAt(new Date('2023-01-19T18:15:00.000Z'))
          .build(),
      ]);
      followingFixture.givenUserFollows({
        user: 'Charlie',
        follows: ['Alice'],
      });

      await fixture.whenUserSeesTheWallOf('Charlie');

      fixture.thenUserShouldSee([
        {
          author: 'Charlie',
          text: 'Charlie message',
          publicationTime: 'less than a minute ago',
        },
        {
          author: 'Alice',
          text: 'Alice message',
          publicationTime: '15 minutes ago',
        },
      ]);
    });
  });
});

const createFixture = ({
  messageRepository,
  followsRepository,
}: {
  messageRepository: MessageRepository;
  followsRepository: FollowsRepository;
}) => {
  const dateProvider = new StubDateProvider();

  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followsRepository,
  );

  let wall: { author: string; text: string; publicationTime: string }[];
  const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
  const wallPresenter: TimelinePresenter = {
    show(timeLine) {
      wall = defaultWallPresenter.show(timeLine);
    },
  };

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheWallOf(author: string) {
      await viewWallUseCase.handle(
        {
          author,
        },
        wallPresenter,
      );
    },
    thenUserShouldSee(
      expectedWall: { author: string; text: string; publicationTime: string }[],
    ) {
      expect(wall).toEqual(expectedWall);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
