import { Message } from "../message";

export const messageBuilder = ({
  id = "message-id",
  author = "Author",
  text = "some text",
  publishedAt = new Date("2023-01-19T19:00:00.000Z"),
}: {
  id?: string;
  author?: string;
  text?: string;
  publishedAt?: Date;
} = {}): Message => ({
  id,
  author,
  text,
  publishedAt,
});
