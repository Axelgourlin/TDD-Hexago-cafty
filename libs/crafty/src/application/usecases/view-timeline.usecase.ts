import { Injectable } from '@nestjs/common';
import { Timeline } from '../../domain/timeline';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

export type ViewTimelineCommand = {
  author: string;
};

@Injectable()
export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    { author }: ViewTimelineCommand,
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const messagesOfAuthor =
      await this.messageRepository.getAllByAuthor(author);

    const timeline = new Timeline(messagesOfAuthor);

    timelinePresenter.show(timeline);
  }
}
