import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CraftyModule } from '@crafty/crafty';
import { PrismaMessageRepository } from '@crafty/crafty/infra/message.prisma.repository';
import { PrismaFollowsRepository } from '@crafty/crafty/infra/follow.prisma.repository';
import { RealDateProvider } from '@crafty/crafty/infra/real-date.provider';
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
  controllers: [ApiController],
})
export class ApiModule {}
