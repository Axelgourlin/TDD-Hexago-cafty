export type Message = {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
};

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

export interface MessageRepository {
  save(message: Message): void;
}

export interface DateProvider {
  getNow(): Date;
}

export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export class PostMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository, private readonly dateProvider: DateProvider) {}

  handle(postMessageCommand: PostMessageCommand) {
    if (postMessageCommand.text.trim().length === 0) {
      throw new EmptyMessageError();
    }

    if (postMessageCommand.text.length > 280) {
      throw new MessageTooLongError();
    }

    const { id, text, author } = postMessageCommand;
    this.messageRepository.save({
      id,
      text,
      author,
      publishedAt: this.dateProvider.getNow(),
    });
  }
}
