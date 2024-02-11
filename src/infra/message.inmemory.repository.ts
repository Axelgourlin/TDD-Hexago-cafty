import { Message } from "../domain/message";
import { MessageRepository } from "./../application/message.repository";

export class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, Message>();

  async getById(messageId: string): Promise<Message> {
    return Promise.resolve(this.getMessageById(messageId));
  }

  async save(msg: Message): Promise<void> {
    this._save(msg);

    return Promise.resolve();
  }

  async getAllByAuthor(author: string): Promise<Message[]> {
    return (await Promise.resolve([...this.messages.values()].filter((message) => message.author === author))).map(
      (m) =>
        Message.fromData({
          id: m.id,
          text: m.text,
          author: m.author,
          publishedAt: m.publishedAt,
        })
    );
  }

  getMessageById(messageId: string): Message {
    return this.messages.get(messageId)!;
  }

  givenExistingMessages(messages: Message[]) {
    messages.forEach(this._save.bind(this));
  }

  private _save(msg: Message): void {
    this.messages.set(msg.id, msg);
  }
}
