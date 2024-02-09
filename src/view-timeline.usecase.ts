import { MessageRepository } from "./message.repository";
import { DateProvider } from "./post-message.usecase";

export type TimeLine = {
  author: string;
  text: string;
  publicationTime: string;
};

export type ViewTimelineCommand = {
  author: string;
};

const ONE_MINUTE_IN_MS = 60000;

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle({ author }: ViewTimelineCommand): Promise<TimeLine[]> {
    const messagesOfAuthor = await this.messageRepository.getAllByAuthor(author);

    messagesOfAuthor.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

    return messagesOfAuthor.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date): string {
    const now = this.dateProvider.getNow();
    const diff = now.getTime() - publishedAt.getTime();
    const minutes = diff / ONE_MINUTE_IN_MS;

    if (minutes < 1) {
      return "less than a minute ago";
    } else {
      const floorMinutes = Math.floor(minutes);
      const pluralizeMinutes = floorMinutes === 1 ? "minute" : "minutes";
      return `${floorMinutes.toString()} ${pluralizeMinutes} ago`;
    }
  }
}
