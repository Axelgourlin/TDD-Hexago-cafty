import { Timeline } from "../../domain/timeline";
import { DateProvider } from "../date.provider";
import { MessageRepository } from "../message.repository";
import { TimelinePresenter } from "../timeline.presenter";

export type ViewTimelineCommand = {
  author: string;
};

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle({ author }: ViewTimelineCommand, timelinePresenter: TimelinePresenter): Promise<void> {
    const messagesOfAuthor = await this.messageRepository.getAllByAuthor(author);

    const timeline = new Timeline(messagesOfAuthor);

    timelinePresenter.show(timeline);
  }
}
