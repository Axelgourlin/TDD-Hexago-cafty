import { FollowUserCommand, FollowUserUseCase } from "../application/usecases/follow-user.usecase";
import { InMemoryFollowsRepository } from "../infra/follow.inmemory.repository";

export const createFollowingFixture = () => {
  const followsRepository = new InMemoryFollowsRepository();
  const followUserUseCase = new FollowUserUseCase(followsRepository);

  return {
    givenUserFollows({ user, follows }: { user: string; follows: string[] }) {
      followsRepository.givenExistingFollows(follows.map((f) => ({ user, follow: f })));
    },
    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);
    },
    async thenUserFollowsAre(userFollows: { user: string; follows: string[] }) {
      const actualFollows = await followsRepository.getFollowsOf(userFollows.user);
      expect(actualFollows).toEqual(userFollows.follows);
    },
    followsRepository,
  };
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>;
