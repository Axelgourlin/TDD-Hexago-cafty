import { Timeline } from "../../domain/timeline";
import { DateProvider } from "../date.provider";
import { MessageRepository } from "../message.repository";

export type ViewTimelineCommand = {
  author: string;
};

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle({ author }: ViewTimelineCommand): Promise<Timeline["data"]> {
    const messagesOfAuthor = await this.messageRepository.getAllByAuthor(author);

    const timeline = new Timeline(messagesOfAuthor, this.dateProvider.getNow());

    return timeline.data;
  }
}
