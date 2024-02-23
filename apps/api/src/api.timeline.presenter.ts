import { FastifyReply } from 'fastify';
import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
import { Timeline } from '@crafty/crafty/domain/timeline';

export class ApiTimeLinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}
  show(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}
