import { userInfo } from "node:os";
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
    console.log(
      ...[server, "👀 [server-sessions.service.ts:95]: server"].reverse(),
    );
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
    const misskeyServerInfo = await client
      .request("meta", {
        detail: true,
      })
      .then((res) => res)
      .catch((err) => {
        console.error(err);
        throw new UnauthorizedException("can not get server info");
      });
    const MisskeyUserInfo = await client
      .request("i", {})
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
        name: misskeyServerInfo.name || "",
        iconUrl: MisskeyUserInfo.avatarUrl || "",
        faviconUrl: misskeyServerInfo.iconUrl || "",
        themeColor: misskeyServerInfo.themeColor || "",
      },
      create: {
        name: misskeyServerInfo.name || "",
        iconUrl: MisskeyUserInfo.avatarUrl || "",
        faviconUrl: misskeyServerInfo.iconUrl || "",
        themeColor: misskeyServerInfo.themeColor || "",
        serverSession: {
          connect: {
            id: serverSessionId,
          },
        },
      },
    });
    console.log(
      ...[
        serverInfoDb,
        "👀 [server-sessions.service.ts:160]: serverInfoDb",
      ].reverse(),
    );
    return new ServerInfoEntity(serverInfoDb);
  }
}
