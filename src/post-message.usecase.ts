export type Message = {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
};

export type PostMessageCommand = {
  id: string;
  author: string;
  text: string;
};

export interface MessageRepository {
  save(message: Message): Promise<void>;
}

export interface DateProvider {
  getNow(): Date;
}

export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export class PostMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  async handle(postMessageCommand: PostMessageCommand): Promise<void> {
    if (postMessageCommand.text.trim().length === 0) {
      throw new EmptyMessageError();
    }

    if (postMessageCommand.text.length > 280) {
      throw new MessageTooLongError();
    }

    const { id, text, author } = postMessageCommand;
    await this.messageRepository.save({
      id,
      text,
      author,
      publishedAt: this.dateProvider.getNow(),
    });
  }
}
