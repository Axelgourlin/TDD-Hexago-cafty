import { MessageRepository } from "./message.repository";
import { DateProvider } from "./post-message.usecase";
import { aliceMessage1, aliceMessage2 } from "./tests/view-timeline.spec";

export type TimeLine = {
  author: string;
  text: string;
  publicationTime: string;
};

export type ViewTimelineCommand = {
  author: string;
};

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle({ author }: ViewTimelineCommand): Promise<TimeLine[]> {
    const messagesOfAuthor = await this.messageRepository.getAllByAuthor(author);

    messagesOfAuthor.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

    return Promise.resolve([
      {
        author: messagesOfAuthor[0].author,
        text: messagesOfAuthor[0].text,
        publicationTime: "1 minute ago",
      },
      {
        author: messagesOfAuthor[1].author,
        text: messagesOfAuthor[1].text,
        publicationTime: "31 minute ago",
      },
    ]);
  }
}
