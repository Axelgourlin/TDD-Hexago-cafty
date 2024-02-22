import { PrismaClient } from "@prisma/client";
import { Message } from "../domain/message";
import { MessageRepository } from "./../application/message.repository";

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(message: Message): Promise<void> {
    const messageData = message.data;

    await this.prisma.user.upsert({
      where: { name: messageData.author },
      update: { name: messageData.author },
      create: {
        name: messageData.author,
      },
    });

    await this.prisma.message.upsert({
      where: { id: messageData.id },
      update: {
        id: messageData.id,
        text: messageData.text,
        authorId: messageData.author,
        publishedAt: messageData.publishedAt,
      },
      create: {
        id: messageData.id,
        text: messageData.text,
        authorId: messageData.author,
        publishedAt: messageData.publishedAt,
      },
    });
  }

  async getById(messageId: string): Promise<Message> {
    const messageData = await this.prisma.message.findFirstOrThrow({
      where: { id: messageId },
    });

    return Message.fromData({
      id: messageData.id,
      text: messageData.text,
      author: messageData.authorId,
      publishedAt: messageData.publishedAt,
    });
  }

  async getAllByAuthor(author: string): Promise<Message[]> {
    const messageData = await this.prisma.message.findMany({
      where: { authorId: author },
    });

    return messageData.map((msg) =>
      Message.fromData({ id: msg.id, text: msg.text, author: msg.authorId, publishedAt: msg.publishedAt })
    );
  }
}
