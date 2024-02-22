import { Message } from "./message";

const ONE_MINUTE_IN_MS = 60000;

export class Timeline {
  constructor(private readonly messages: Message[], private readonly now: Date) {}

  get data() {
    this.messages.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

    return this.messages.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date): string {
    const diff = this.now.getTime() - publishedAt.getTime();
    const minutes = diff / ONE_MINUTE_IN_MS;

    if (minutes < 1) {
      return "less than a minute ago";
    } else {
      const floorMinutes = Math.floor(minutes);
      const pluralizeMinutes = floorMinutes === 1 ? "minute" : "minutes";
      return `${floorMinutes.toString()} ${pluralizeMinutes} ago`;
    }
  }
}
