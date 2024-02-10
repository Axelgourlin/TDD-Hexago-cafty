export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export type Message = {
  id: string;
  author: string;
  text: MessageText;
  publishedAt: Date;
};

export class MessageText {
  private constructor(readonly value: string) {}

  static of(text: string) {
    if (text.trim().length === 0) {
      throw new EmptyMessageError();
    }

    if (text.length > 280) {
      throw new MessageTooLongError();
    }

    return new MessageText(text);
  }
}
