import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import { APIClient } from "misskey-js/api.js";
import { User } from "misskey-js/entities.js";
import { PrismaService } from "../../lib/prisma.service";
import { CreateServerSessionDto } from "./dto/creste.dto";
import { CreateServerSessionResponseEntity } from "./entities/create-server.entity";
import { ServerInfoEntity } from "./entities/server-info.entity";

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
    await this.updateOrCreateServerInfo(
      newServerSession.id,
      data.origin,
      userId,
    );
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
  async getServerSessionfromId(Id: string) {
    const server = await this.prisma.serverSession.findUnique({
      where: {
        id: Id,
      },
    });
    return new CreateServerSessionResponseEntity(server);
  }
  async getServerSessionfromUseridAndOrigin(UserId: string, origin: string) {
    const server = await this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention:
        origin_userId: {
          userId: UserId,
          origin: origin,
        },
      },
    });
    return new CreateServerSessionResponseEntity(server);
  }
  async updateOrCreateServerInfo(
    serverSessionId: string,
    origin: string,
    userId: string,
  ) {
    const ServerInfo = await this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention:
        origin_userId: {
          userId: userId,
          origin,
        },
      },
      select: {
        serverToken: true,
      },
    });
    const client = new APIClient({
      origin: origin,
      credential: ServerInfo.serverToken,
    });
    const serverInfo = await client
      .request("i", {
        detail: true,
      })
      .then((res) => res)
      .catch((err) => {
        console.error(err);
        throw new UnauthorizedException("can not get server info");
      });

    const serverInfoDb = await this.prisma.serverInfo.upsert({
      where: {
        serverSessionId,
      },
      update: {
        name: serverInfo.instance.name,
        iconUrl: serverInfo.instance.iconUrl,
        faviconUrl: serverInfo.instance.faviconUrl,
        themeColor: serverInfo.instance.themeColor,
        softwareName: serverInfo.instance.softwareName,
        softwareVersion: serverInfo.instance.softwareVersion,
      },
      create: {
        name: serverInfo.instance.name,
        iconUrl: serverInfo.instance.iconUrl,
        faviconUrl: serverInfo.instance.faviconUrl,
        themeColor: serverInfo.instance.themeColor,
        softwareName: serverInfo.instance.softwareName,
        softwareVersion: serverInfo.instance.softwareVersion,
        serverSession: {
          connect: {
            id: serverSessionId,
          },
        },
      },
    });
    return new ServerInfoEntity(serverInfoDb);
  }
}
