import { DateProvider } from '@crafty/crafty/application/date.provider';
import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
import { Timeline } from '@crafty/crafty/domain/timeline';
import { Injectable } from '@nestjs/common';

const ONE_MINUTE_IN_MS = 60000;

@Injectable()
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
      return 'less than a minute ago';
    } else {
      const floorMinutes = Math.floor(minutes);
      const pluralizeMinutes = floorMinutes === 1 ? 'minute' : 'minutes';
      return `${floorMinutes.toString()} ${pluralizeMinutes} ago`;
    }
  }
}
