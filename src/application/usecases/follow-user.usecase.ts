import { FollowsRepository } from "../follows.repository";

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

export class FollowUserUseCase {
  constructor(private followsRepository: FollowsRepository) {}
  async handle(followUserCommand: FollowUserCommand) {
    await this.followsRepository.saveFollow({
      user: followUserCommand.user,
      follow: followUserCommand.userToFollow,
    });
  }
}
