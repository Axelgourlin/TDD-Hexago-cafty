import { MessageText } from "./message";
import { MessageRepository } from "./message.repository";

export type PostMessageCommand = {
  id: string;
  author: string;
  text: string;
};

export interface DateProvider {
  getNow(): Date;
}

export class PostMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle(postMessageCommand: PostMessageCommand): Promise<void> {
    const { id, text, author } = postMessageCommand;
    const messageText = MessageText.of(text);

    await this.messageRepository.save({
      id,
      author,
      text: messageText,
      publishedAt: this.dateProvider.getNow(),
    });
  }
}
