import * as fs from "fs";
import * as path from "path";
import { MessageRepository } from "./message.repository";
import { Message } from "./message";

export class FileSystemMessageRepository implements MessageRepository {
  private readonly messagePath = path.join(__dirname, "message.json");

  async save(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.push(message);

    return fs.promises.writeFile(this.messagePath, JSON.stringify(messages));
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

    return messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      author: msg.author,
      publishedAt: new Date(msg.publishedAt),
    }));
  }

  async getAllByAuthor(author: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((msg) => msg.author === author);
  }
}
