import { Injectable } from '@nestjs/common';

export type Follow = {
  user: string;
  follow: string;
};

@Injectable()
export abstract class FollowsRepository {
  abstract saveFollow(follow: Follow): Promise<void>;
  abstract getFollowsOf(user: string): Promise<string[] | undefined>;
}
