import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import { User } from "misskey-js/entities.js";
import { PrismaService } from "../../lib/prisma.service";
import { CreateServerSessionDto } from "./dto/creste.dto";
import { CreateServerSessionResponseEntity } from "./entities/create-server.entity";

@Injectable()
export class ServerSessionsService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateServerSessionDto, userId: string) {
    const getServerType =
      data.serverType.toLowerCase() === "misskey"
        ? ServerType.Misskey
        : ServerType.OtherServer;

    const fetchMisskey: {
      ok: boolean;
      token: string;
      user: User;
    } = await fetch(`${data.origin}/api/miauth/${data.sessionToken}/check`, {
      method: "POST",
      headers: {
        "Content-Length": "0",
      },
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
        return new UnauthorizedException("can not auth misskey server");
      });
    if (fetchMisskey.ok === false) {
      throw new UnauthorizedException("can not auth misskey");
    }

    console.log(
      ...[
        fetchMisskey,
        "👀 [server-sessions.service.ts:39]: fetchMisskey",
      ].reverse(),
    );
    const newServerSession = await this.prisma.serverSession.create({
      data: {
        origin: data.origin,
        serverType: getServerType,
        serverToken: fetchMisskey.token,
        serverUserInfo: {
          create: {
            id: fetchMisskey.user.id,
            name: fetchMisskey.user.name,
            username: fetchMisskey.user.username,
            avatarUrl: fetchMisskey.user.avatarUrl,
          },
        },

        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return new CreateServerSessionResponseEntity(newServerSession);
  }
  async getList(userId: string) {
    const serverList = await this.prisma.serverSession.findMany({
      where: {
        userId,
      },
    });
    return serverList.map((server) => {
      return new CreateServerSessionResponseEntity(server);
    });
  }
}
