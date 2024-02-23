import { FollowingFixture, createFollowingFixture } from "./following.fixture";

describe("Feature: Following a user", () => {
  let fixture: FollowingFixture;
  beforeEach(() => {
    fixture = createFollowingFixture();
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
