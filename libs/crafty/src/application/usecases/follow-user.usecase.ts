import { Injectable } from '@nestjs/common';
import { FollowsRepository } from '../follows.repository';

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

@Injectable()
export class FollowUserUseCase {
  constructor(private followsRepository: FollowsRepository) {}
  async handle(followUserCommand: FollowUserCommand) {
    await this.followsRepository.saveFollow({
      user: followUserCommand.user,
      follow: followUserCommand.userToFollow,
    });
  }
}
