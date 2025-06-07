import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { APIClient } from "misskey-js/api.js";
import { User } from "misskey-js/entities.js";
import { ServerType } from "~/generated/prisma";
// PrismaService is removed as it's now used in the repository
import { CreateServerSessionDto } from "./dto/creste.dto";
import { UpdateServerInfoDto } from "./dto/update-server-info.dto";
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

    if (!fetchMisskey || fetchMisskey.ok === false) {
      throw new UnauthorizedException(
        "Cannot authenticate with Misskey server",
      );
    }

    const client = new APIClient({
      origin: data.origin,
      credential: fetchMisskey.token,
    });

    const misskeyServerInfo = await client
      .request("meta", {
        detail: true,
      })
      .catch((err) => {
        console.error(err);
        throw new UnauthorizedException("can not get server info");
      });

    const MisskeyUserInfo = await client.request("i", {}).catch((err) => {
      console.error(err);
      throw new UnauthorizedException(
        "Cannot get user info from Misskey server",
      );
    });

    const newServerSession =
      await this.serverSessionsRepository.createServerSession({
        origin: data.origin,
        serverType: serverType,
        serverToken: fetchMisskey.token,
        user: {
          connect: {
            id: userId,
          },
        },
        serverInfo: {
          create: {
            name: misskeyServerInfo.name || "",
            iconUrl: MisskeyUserInfo.avatarUrl || "",
            faviconUrl: misskeyServerInfo.iconUrl || "",
            themeColor: misskeyServerInfo.themeColor || "",
          },
        },
        serverUserInfo: {
          create: {
            name: MisskeyUserInfo.name || "",
            username: MisskeyUserInfo.username,
            avatarUrl: MisskeyUserInfo.avatarUrl || "",
          },
        },
      });

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
    const server =
      await this.serverSessionsRepository.findServerSessionById(id);
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

  async updateServerInfo(serverSessionId: string, data: UpdateServerInfoDto) {
    // biome-ignore lint/performance/noDelete: <explanation>
    delete data.origin;
    const serverInfo = await this.serverSessionsRepository.updateServerInfo(
      serverSessionId,
      data,
    );
    return new ServerInfoEntity(serverInfo);
  }
}
