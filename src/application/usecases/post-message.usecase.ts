import { Message } from "../../domain/message";
import { DateProvider } from "../date.provider";
import { MessageRepository } from "../message.repository";

export type PostMessageCommand = {
  id: string;
  author: string;
  text: string;
};

export class PostMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle(postMessageCommand: PostMessageCommand): Promise<void> {
    const { id, text, author } = postMessageCommand;

    await this.messageRepository.save(
      Message.fromData({
        id,
        author,
        text,
        publishedAt: this.dateProvider.getNow(),
      })
    );
  }
}
