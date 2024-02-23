import * as fs from "fs";
import * as path from "path";
import { Follow, FollowsRepository } from "../application/follows.repository";

export class FileSystemFollowRepository implements FollowsRepository {
  constructor(private readonly followPath = path.join(__dirname, "follow.json")) {}

  async saveFollow(follow: Follow): Promise<void> {
    const follows = await this.getFollows();
    const actualUserFollows = follows[follow.user] ?? [];
    actualUserFollows.push(follow.follow);
    follows[follow.user] = actualUserFollows;

    return fs.promises.writeFile(this.followPath, JSON.stringify(follows));
  }

  async getFollowsOf(user: string): Promise<string[] | undefined> {
    const data = await fs.promises.readFile(this.followPath);
    const follows = JSON.parse(data.toString()) as {
      [user: string]: string[];
    };

    return follows[user] ?? undefined;
  }

  private async getFollows() {
    const data = await fs.promises.readFile(this.followPath);
    return JSON.parse(data.toString()) as { [user: string]: string[] };
  }
}
