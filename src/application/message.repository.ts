import { Message } from "../domain/message";

export interface MessageRepository {
  getById(messageId: string): Promise<Message>;
  getAllByAuthor(author: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
}