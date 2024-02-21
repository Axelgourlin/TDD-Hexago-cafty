import { Follow, FollowsRepository } from "../application/follows.repository";

export class InMemoryFollowsRepository implements FollowsRepository {
  followsByUser = new Map<string, string[]>();

  saveFollow(follow: Follow): Promise<void> {
    this.addFollow(follow);
    return Promise.resolve();
  }

  givenExistingFollows(follows: Follow[]) {
    follows.forEach((f) => {
      this.addFollow(f);
    });
  }

  private addFollow(follow: Follow) {
    const existingFollows = this.followsByUser.get(follow.user) ?? [];
    existingFollows.push(follow.follow);
    this.followsByUser.set(follow.user, existingFollows);
  }

  getFollowsOf(user: string): string[] {
    return this.followsByUser.get(user) ?? [];
  }
}
