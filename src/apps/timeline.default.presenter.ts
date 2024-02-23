import { DateProvider } from "./../application/date.provider";
import { Timeline } from "../domain/timeline";
import { TimelinePresenter } from "../application/timeline.presenter";

const ONE_MINUTE_IN_MS = 60000;

export class DefaultTimelinePresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) {}

  show(timeline: Timeline): {
    author: string;
    text: string;
    publicationTime: string;
  }[] {
    const messages = timeline.data;
    return messages.map((msg) => ({
      author: msg.author,
      text: msg.text,
      publicationTime: this.computePublicationTime(msg.publishedAt),
    }));
  }

  private computePublicationTime(publishedAt: Date): string {
    const now = this.dateProvider.getNow();
    const minutes = (now.getTime() - publishedAt.getTime()) / ONE_MINUTE_IN_MS;

    if (minutes < 1) {
      return "less than a minute ago";
    } else {
      const floorMinutes = Math.floor(minutes);
      const pluralizeMinutes = floorMinutes === 1 ? "minute" : "minutes";
      return `${floorMinutes.toString()} ${pluralizeMinutes} ago`;
    }
  }
}
