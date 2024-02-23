import { CraftyModule } from '@crafty/crafty';
import { PrismaFollowsRepository } from '@crafty/crafty/infra/follow.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infra/message.prisma.repository';
import { RealDateProvider } from '@crafty/crafty/infra/real-date.provider';
import { Module } from '@nestjs/common';
import { commands } from './commands';
import { CliTimeLinePresenter } from './cli.timeline.presenter';
import { CustomConsoleLogger } from './custom.console.logger';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FollowsRepository: PrismaFollowsRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  providers: [...commands, CliTimeLinePresenter, CustomConsoleLogger],
})
export class CliModule {}
