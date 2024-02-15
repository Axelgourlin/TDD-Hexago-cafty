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

type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

const createFixture = () => {
  return {
    givenUserFollows(userFollows: { user: string; follows: string[] }) {},
    async whenUserFollows(followUserCommand: FollowUserCommand) {},
    async thenUserFollowsAre(userFollows: { user: string; follows: string[] }) {},
  };
};

type Fixture = ReturnType<typeof createFixture>;
