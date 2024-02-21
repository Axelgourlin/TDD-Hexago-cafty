export type Follow = {
  user: string;
  follow: string;
};

export interface FollowsRepository {
  saveFollow(follow: Follow): Promise<void>;
}