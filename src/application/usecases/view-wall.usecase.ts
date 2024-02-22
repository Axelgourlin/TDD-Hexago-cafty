import { FollowsRepository } from "./../follows.repository";
import { DateProvider } from "../date.provider";
import { MessageRepository } from "../message.repository";
import { Timeline } from "../../domain/timeline";

export type ViewWallCommand = {
  author: string;
};

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followsRepository: FollowsRepository,
    private readonly dateProvider: DateProvider
  ) {}
  async handle({ author }: { author: string }): Promise<Timeline["data"]> {
    const follows = await this.followsRepository.getFollowsOf(author);
    if (!follows) {
      return [];
    }
    const messages = (
      await Promise.all([author, ...follows].map((author) => this.messageRepository.getAllByAuthor(author)))
    ).flat();

    const timeline = new Timeline(messages, this.dateProvider.getNow());

    return timeline.data;
  }
}