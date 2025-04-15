import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import { APIClient } from "misskey-js/api.js";
import { User } from "misskey-js/entities.js";
// PrismaService is removed as it's now used in the repository
import { CreateServerSessionDto } from "./dto/creste.dto";
import { CreateServerSessionResponseEntity } from "./entities/create-server.entity";
import { ServerInfoEntity } from "./entities/server-info.entity";
import { ServerSessionsRepository } from "./server-sessions.repository"; // Import the repository

@Injectable()
export class ServerSessionsService {
  // Inject the repository instead of PrismaService
  constructor(private serverSessionsRepository: ServerSessionsRepository) {}

  async create(data: CreateServerSessionDto, userId: string) {
    const serverType =
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
    // Use repository to find server sessions
    const serverList =
      await this.serverSessionsRepository.findServerSessionsByUserId(userId);
    return serverList.map((server) => {
      return new CreateServerSessionResponseEntity(server);
    });
  }

  async getServerSessionfromId(id: string) {
    // Use repository to find server session by ID
    const server = await this.serverSessionsRepository.findServerSessionById(id);
    if (!server) {
      throw new NotFoundException(`Server session with ID ${id} not found`);
    }
    return new CreateServerSessionResponseEntity(server);
  }

  async getServerSessionfromUseridAndOrigin(userId: string, origin: string) {
    // Use repository to find server session by user ID and origin
    const server =
      await this.serverSessionsRepository.findServerSessionByUserIdAndOrigin(
        userId,
        origin,
      );
    if (!server) {
      throw new NotFoundException(
        `Server session for user ${userId} and origin ${origin} not found`,
      );
    }
    console.log(
      ...[server, "👀 [server-sessions.service.ts:95]: server"].reverse(),
    );
    return new CreateServerSessionResponseEntity(server);
  }
  async updateOrCreateServerInfo(
    serverSessionId: string,
    serverSessionId: string,
    origin: string,
    userId: string,
  ) {
    // Use repository to get the server token
    const serverSessionData =
      await this.serverSessionsRepository.findServerSessionToken(userId, origin);

    if (!serverSessionData?.serverToken) {
      throw new NotFoundException(
        `Server session token not found for user ${userId} and origin ${origin}`,
      );
    }

    const client = new APIClient({
      origin: origin,
      credential: serverSessionData.serverToken,
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
        throw new UnauthorizedException("Cannot get user info from Misskey server");
      });

    // Use repository to upsert server info
    const serverInfoDb = await this.serverSessionsRepository.upsertServerInfo(
      serverSessionId,
      {
        name: misskeyServerInfo.name || "",
        // Assuming iconUrl in ServerInfo maps to user's avatarUrl from Misskey 'i' endpoint
        iconUrl: MisskeyUserInfo.avatarUrl || "",
        faviconUrl: misskeyServerInfo.iconUrl || "", // From Misskey 'meta' endpoint
        themeColor: misskeyServerInfo.themeColor || "", // From Misskey 'meta' endpoint
      },
    );
    console.log(
      ...[
        serverInfoDb,
        "👀 [server-sessions.service.ts:160]: serverInfoDb",
      ].reverse(),
    );
    return new ServerInfoEntity(serverInfoDb);
  }
}
