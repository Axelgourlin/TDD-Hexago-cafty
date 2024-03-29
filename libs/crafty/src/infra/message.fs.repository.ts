import * as fs from "fs";
import * as path from "path";
import { MessageRepository } from "../application/message.repository";
import { Message } from "../domain/message";

export class FileSystemMessageRepository implements MessageRepository {
  constructor(private readonly messagePath = path.join(__dirname, "message.json")) {}

  async getById(messageId: string): Promise<Message> {
    const allMessages = await this.getMessages();
    return allMessages.find((msg) => msg.id === messageId)!;
  }

  async getAllByAuthor(author: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((msg) => msg.author === author);
  }

  async save(message: Message): Promise<void> {
    const messages = await this.getMessages();
    const existingMessageIndex = messages.findIndex((m) => m.id === message.id);
    if (existingMessageIndex === -1) {
      messages.push(message);
    } else {
      messages[existingMessageIndex] = message;
    }

    return fs.promises.writeFile(this.messagePath, JSON.stringify(messages.map((msg) => msg.data)));
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.messagePath);
    const dataString = data.toString();
    if (!dataString) {
      return [];
    }
    const messages = JSON.parse(dataString) as {
      id: string;
      text: string;
      author: string;
      publishedAt: string;
    }[];

    return messages.map((msg) =>
      Message.fromData({
        id: msg.id,
        text: msg.text,
        author: msg.author,
        publishedAt: new Date(msg.publishedAt),
      })
    );
  }
}
