import { TimelinePresenter } from '../timeline.presenter';
import { FollowsRepository } from '../follows.repository';
import { MessageRepository } from '../message.repository';
import { Timeline } from '../../domain/timeline';
import { Injectable } from '@nestjs/common';

export type ViewWallCommand = {
  author: string;
};

@Injectable()
export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followsRepository: FollowsRepository,
  ) {}
  async handle(
    { author }: { author: string },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const follows = await this.followsRepository.getFollowsOf(author);
    if (!follows) {
      return;
    }
    const messages = (
      await Promise.all(
        [author, ...follows].map((author) =>
          this.messageRepository.getAllByAuthor(author),
        ),
      )
    ).flat();

    const timeline = new Timeline(messages);

    timelinePresenter.show(timeline);
  }
}
