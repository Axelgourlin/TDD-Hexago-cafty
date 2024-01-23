import { Message } from "./message";
import { MessageRepository } from "./message.repository";

export class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, Message>();
  async save(msg: Message): Promise<void> {
    this._save(msg);

    return Promise.resolve();
  }

  async getAllByAuthor(author: string): Promise<Message[]> {
    return await Promise.resolve([...this.messages.values()].filter((message) => message.author === author));
  }

  getMessageById(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }

  givenExistingMessages(messages: Message[]) {
    messages.forEach(this._save.bind(this));
  }

  private _save(msg: Message): void {
    this.messages.set(msg.id, msg);
  }
}
