import { PrismaClient } from '@prisma/client';
import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { PostMessageUseCase } from './application/usecases/post-message.usecase';
import { EditMessageUseCase } from './application/usecases/edit-message.usecase';
import { FollowUserUseCase } from './application/usecases/follow-user.usecase';
import { ViewTimelineUseCase } from './application/usecases/view-timeline.usecase';
import { ViewWallUseCase } from './application/usecases/view-wall.usecase';
import { DefaultTimelinePresenter } from '../../../apps/cli/src/default.timeline.presenter';
import { MessageRepository } from './application/message.repository';
import { FollowsRepository } from './application/follows.repository';
import { DateProvider } from './application/date.provider';

@Module({})
export class CraftyModule {
  static register(providers: {
    MessageRepository: ClassProvider<MessageRepository>['useClass'];
    FollowsRepository: ClassProvider<FollowsRepository>['useClass'];
    DateProvider: ClassProvider<DateProvider>['useClass'];
    PrismaClient: ClassProvider<PrismaClient>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        {
          provide: MessageRepository,
          useClass: providers.MessageRepository,
        },
        {
          provide: FollowsRepository,
          useClass: providers.FollowsRepository,
        },
        {
          provide: DateProvider,
          useClass: providers.DateProvider,
        },
        {
          provide: PrismaClient,
          useClass: providers.PrismaClient,
        },
      ],
      exports: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
      ],
    };
  }
}
