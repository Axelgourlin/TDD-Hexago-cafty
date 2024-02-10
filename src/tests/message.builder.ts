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
} = {}) => {
  const props = {
    id,
    author,
    text,
    publishedAt,
  };

  return {
    withId(_id: string) {
      return messageBuilder({ ...props, id: _id });
    },
    withAuthor(_author: string) {
      return messageBuilder({ ...props, author: _author });
    },
    withText(_text: string) {
      return messageBuilder({ ...props, text: _text });
    },
    withPublishedAt(_publishedAt: Date) {
      return messageBuilder({ ...props, publishedAt: _publishedAt });
    },

    build(): Message {
      return {
        id: props.id,
        author: props.author,
        text: props.text,
        publishedAt: props.publishedAt,
      };
    },
  };
};