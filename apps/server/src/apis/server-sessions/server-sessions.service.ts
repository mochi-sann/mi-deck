import { Injectable } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import { PrismaService } from "src/lib/prisma.service";
import { CreateServerSessionDto } from "./dto/creste.dto";

@Injectable()
export class ServerSessionsService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateServerSessionDto, userId: string) {
    const getServerType =
      data.serverType === "Misskey"
        ? ServerType.Misskey
        : ServerType.OtherServer;
    return await this.prisma.serverSession.create({
      data: {
        token: data.sessionToken,
        origin: data.origin,
        serverType: getServerType,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
