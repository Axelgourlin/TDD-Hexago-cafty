import { PrismaClient } from '@prisma/client';
import { Follow, FollowsRepository } from './../application/follows.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaFollowsRepository implements FollowsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveFollow(follow: Follow): Promise<void> {
    await this.upsertUser(follow.user);
    await this.upsertUser(follow.follow);
    await this.prisma.user.update({
      where: { name: follow.user },
      data: {
        following: {
          connectOrCreate: [
            {
              where: { name: follow.follow },
              create: { name: follow.follow },
            },
          ],
        },
      },
    });
  }
  async getFollowsOf(user: string): Promise<string[]> {
    const theUser = await this.prisma.user.findFirstOrThrow({
      where: { name: user },
      include: {
        following: true,
      },
    });

    return theUser.following.map((f) => f.name);
  }

  private async upsertUser(user: string) {
    await this.prisma.user.upsert({
      where: { name: user },
      update: { name: user },
      create: {
        name: user,
      },
    });
  }
}
