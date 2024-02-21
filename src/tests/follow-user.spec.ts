import { FollowUserCommand, FollowUserUseCase } from "../application/usecases/follow-user.usecase";
import { InMemoryFollowsRepository } from "../infra/follow.inmemory.repository";

describe("Feature: Following a user", () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  });
  test("Alice can follow Bob", async () => {
    fixture.givenUserFollows({
      user: "Alice",
      follows: ["Charlie"],
    });

    await fixture.whenUserFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFollowsAre({
      user: "Alice",
      follows: ["Charlie", "Bob"],
    });
  });
});

const createFixture = () => {
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
      const actualFollows = followsRepository.getFollowsOf(userFollows.user);
      expect(actualFollows).toEqual(userFollows.follows);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
