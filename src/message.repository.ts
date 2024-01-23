import { Message } from "./message";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  getAllByAuthor(author: string): Promise<Message[]>;
}
