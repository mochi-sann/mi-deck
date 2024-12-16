import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ServerType } from "@prisma/client";
import * as Misskey from "misskey-js";
import { User } from "misskey-js/entities.js";
import { PrismaService } from "../../lib/prisma.service.js";
import { CreateServerSessionDto } from "./dto/creste.dto.js";

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
    } = await fetch(
      `https://${data.origin}/api/miauth/${data.sessionToken}/check`,
      {
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
      },
    )
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
        return new UnauthorizedException("can not auth misskey server");
      });
    if (fetchMisskey.ok === false) {
      throw new UnauthorizedException("can not auth misskey");
    }

    return await this.prisma.serverSession.create({
      data: {
        origin: data.origin,
        serverType: getServerType,
        serverToken: fetchMisskey.token,

        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
