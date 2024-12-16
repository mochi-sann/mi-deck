import { Injectable } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import { api } from "misskey-js";
import { PrismaService } from "src/lib/prisma.service.js";
import { CreateServerSessionDto } from "./dto/creste.dto.js";

@Injectable()
export class ServerSessionsService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateServerSessionDto, userId: string) {
    const getServerType =
      data.serverType === "Misskey"
        ? ServerType.Misskey
        : ServerType.OtherServer;
    const MisskeyApi = new api.APIClient({
      origin: `https://${data.origin}`,
      credential: data.sessionToken,
    });

    const serverInfo = await MisskeyApi.request("meta", { detail: true });
    console.log(
      ...[
        serverInfo,
        "👀 [server-sessions.service.ts:21]: serverInfo",
      ].reverse(),
    );
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
