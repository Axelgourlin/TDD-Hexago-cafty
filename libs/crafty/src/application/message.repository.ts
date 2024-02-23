import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message';

@Injectable()
export abstract class MessageRepository {
  abstract getById(messageId: string): Promise<Message>;
  abstract getAllByAuthor(author: string): Promise<Message[]>;
  abstract save(message: Message): Promise<void>;
}
