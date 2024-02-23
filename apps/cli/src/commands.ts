import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/edit-message.usecase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/follow-user.usecase';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/post-message.usecase';
import {
  ViewTimelineCommand,
  ViewTimelineUseCase,
} from '@crafty/crafty/application/usecases/view-timeline.usecase';
import {
  ViewWallCommand,
  ViewWallUseCase,
} from '@crafty/crafty/application/usecases/view-wall.usecase';
import { randomUUID } from 'crypto';
import { Command, CommandRunner } from 'nest-commander';
import { CliTimeLinePresenter } from './cli.timeline.presenter';

@Command({
  name: 'post',
  description: 'Post a message',
  arguments: '<author> <message>',
})
class PostCommand extends CommandRunner {
  constructor(private readonly postMessageUseCase: PostMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const postMessageCommand: PostMessageCommand = {
      id: randomUUID(),
      author: passedParams[0],
      text: passedParams[1],
    };
    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);

      if (result.isOk()) {
        console.log('✅ Message posted');
        process.exit(0);
      }

      console.error('❌ Failed to post message', result.error);
      process.exit(1);
    } catch (error) {
      console.error('❌ Failed to post message', error);
      process.exit(1);
    }
  }
}

@Command({
  name: 'edit',
  description: 'Edit a message',
  arguments: '<message-id> <message>',
})
class EditCommand extends CommandRunner {
  constructor(private readonly editMessageUseCase: EditMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const editMessageCommand: EditMessageCommand = {
      messageId: passedParams[0],
      text: passedParams[1],
    };
    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);

      if (result.isOk()) {
        console.log('✅ Message edited');
        process.exit(0);
      }

      console.error('❌ Failed to edit message', result.error);
      process.exit(1);
    } catch (error) {
      console.error('❌ Failed to edit message', error);
      process.exit(1);
    }
  }
}

@Command({
  name: 'view',
  description: 'View the timeline',
  arguments: '<author>',
})
class ViewCommand extends CommandRunner {
  constructor(
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly cliTimeLinePresenter: CliTimeLinePresenter,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const viewTimelineCommand: ViewTimelineCommand = {
      author: passedParams[0],
    };
    try {
      const timeline = await this.viewTimelineUseCase.handle(
        viewTimelineCommand,
        this.cliTimeLinePresenter,
      );
      console.log(timeline);
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to view timeline', error);
      process.exit(1);
    }
  }
}

@Command({
  name: 'follow',
  description: 'Follow a user',
  arguments: '<user> <user-to-follow>',
})
class FollowCommand extends CommandRunner {
  constructor(private readonly followUserUseCase: FollowUserUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const followUserCommand: FollowUserCommand = {
      user: passedParams[0],
      userToFollow: passedParams[1],
    };
    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log(`✅ ${passedParams[1]} is now followed`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to follow user', error);
      process.exit(1);
    }
  }
}

@Command({
  name: 'wall',
  description: 'View the wall',
  arguments: '<user>',
})
class WallCommand extends CommandRunner {
  constructor(
    private readonly viewWallUseCase: ViewWallUseCase,
    private readonly cliTimeLinePresenter: CliTimeLinePresenter,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const viewWallCommand: ViewWallCommand = {
      author: passedParams[0],
    };
    try {
      const wall = await this.viewWallUseCase.handle(
        viewWallCommand,
        this.cliTimeLinePresenter,
      );
      console.log(wall);
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to view wall', error);
      process.exit(1);
    }
  }
}

export const commands = [
  PostCommand,
  EditCommand,
  ViewCommand,
  FollowCommand,
  WallCommand,
];
