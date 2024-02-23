import { ApiTimeLinePresenter } from './api.timeline.presenter';
import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  ForbiddenException,
  Query,
  Res,
} from '@nestjs/common';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/post-message.usecase';
import { randomUUID } from 'crypto';
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/edit-message.usecase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/follow-user.usecase';
import {
  ViewTimelineCommand,
  ViewTimelineUseCase,
} from '@crafty/crafty/application/usecases/view-timeline.usecase';
import {
  ViewWallCommand,
  ViewWallUseCase,
} from '@crafty/crafty/application/usecases/view-wall.usecase';
import { FastifyReply } from 'fastify';

@Controller()
export class ApiController {
  constructor(
    private readonly postMessageUseCase: PostMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly viewWallUseCase: ViewWallUseCase,
  ) {}

  @Post('/post-message')
  async postMessage(
    @Body() body: { user: string; text: string },
  ): Promise<void> {
    const postMessageCommand: PostMessageCommand = {
      id: randomUUID(),
      author: body.user,
      text: body.text,
    };
    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);

      if (result.isErr()) {
        throw new ForbiddenException(result.error);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('/edit-message')
  async editMessage(
    @Body() body: { messageId: string; text: string },
  ): Promise<void> {
    const editMessageCommand: EditMessageCommand = {
      messageId: body.messageId,
      text: body.text,
    };
    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);

      if (result.isErr()) {
        throw new ForbiddenException(result.error);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('/follow-user')
  async followUser(
    @Body() body: { user: string; userToFollow: string },
  ): Promise<void> {
    const followUserCommand: FollowUserCommand = {
      user: body.user,
      userToFollow: body.userToFollow,
    };
    try {
      await this.followUserUseCase.handle(followUserCommand);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/view-timeline')
  async viewTimeline(
    @Query() query: { user: string },
    @Res() response: FastifyReply,
  ): Promise<void> {
    const viewTimelineCommand: ViewTimelineCommand = {
      author: query.user,
    };
    try {
      const apiTimeLinePresenter = new ApiTimeLinePresenter(response);
      await this.viewTimelineUseCase.handle(
        viewTimelineCommand,
        apiTimeLinePresenter,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/view-wall')
  async viewWall(
    @Query() query: { user: string },
    @Res() response: FastifyReply,
  ): Promise<void> {
    const viewWallCommand: ViewWallCommand = {
      author: query.user,
    };
    try {
      const apiTimeLinePresenter = new ApiTimeLinePresenter(response);
      await this.viewWallUseCase.handle(viewWallCommand, apiTimeLinePresenter);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
