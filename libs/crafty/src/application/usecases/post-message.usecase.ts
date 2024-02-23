import { Injectable } from '@nestjs/common';
import {
  EmptyMessageError,
  Message,
  MessageTooLongError,
} from '../../domain/message';
import { DateProvider } from '../date.provider';
import { MessageRepository } from '../message.repository';
import { Err, Ok, Result } from '../result';

export type PostMessageCommand = {
  id: string;
  author: string;
  text: string;
};

@Injectable()
export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle(
    postMessageCommand: PostMessageCommand,
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    const { id, text, author } = postMessageCommand;

    let messagesToSave: Message;
    try {
      messagesToSave = Message.fromData({
        id,
        author,
        text,
        publishedAt: this.dateProvider.getNow(),
      });
    } catch (error) {
      return Err.of(error);
    }

    await this.messageRepository.save(messagesToSave);

    return Ok.of(undefined);
  }
}
