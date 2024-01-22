import { MessageRepository, Message } from "./post-message.usecase";

export class InMemoryMessageRepository implements MessageRepository {
  message: Message;
  async save(msg: Message): Promise<void> {
    this.message = msg;

    return Promise.resolve();
  }
}
