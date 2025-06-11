import { Injectable } from "@nestjs/common";
import { Prisma, ServerInfo, ServerSession } from "~/generated/prisma";
import { PrismaService } from "../../lib/prisma.service";

@Injectable()
export class ServerSessionsRepository {
  constructor(private prisma: PrismaService) {}

  async createServerSession(
    data: Prisma.ServerSessionCreateInput,
  ): Promise<ServerSession> {
    return this.prisma.serverSession.create({
      data,
      include: {
        serverInfo: true,
        serverUserInfo: true,
      },
    });
  }

  async findServerSessionsByUserId(userId: string): Promise<ServerSession[]> {
    return this.prisma.serverSession.findMany({
      where: { userId },
      include: {
        serverInfo: true,
        serverUserInfo: true,
      },
    });
  }

  async findServerSessionById(id: string): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: { id },
      include: {
        serverInfo: true,
        serverUserInfo: true,
      },
    });
  }

  async findServerSessionByUserIdAndOrigin(
    userId: string,
    origin: string,
  ): Promise<ServerSession[]> {
    return this.prisma.serverSession.findMany({
      where: { userId, origin },
      include: {
        serverInfo: true,
        serverUserInfo: true,
      },
    });
  }

  async findServerSessionByUserIdOriginAndMisskeyUserId(
    userId: string,
    origin: string,
    misskeyUserId: string,
  ): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention: Prisma constraint name
        userId_origin_misskeyUserId: { userId, origin, misskeyUserId },
      },
      include: {
        serverInfo: true,
        serverUserInfo: true,
      },
    });
  }

  async findServerSessionToken(
    userId: string,
    origin: string,
    misskeyUserId: string,
  ): Promise<{ serverToken: string } | null> {
    return this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention: Prisma constraint name
        userId_origin_misskeyUserId: { userId, origin, misskeyUserId },
      },
      select: { serverToken: true },
    });
  }

  async upsertServerInfo(
    serverSessionId: string,
    data: Omit<Prisma.ServerInfoUncheckedCreateInput, "serverSessionId">,
  ): Promise<ServerInfo> {
    return this.prisma.serverInfo.upsert({
      where: { serverSessionId },
      update: data,
      create: {
        ...data,
        serverSessionId,
      },
    });
  }

  async updateServerInfo(
    serverSessionId: string,
    data: Partial<
      Omit<Prisma.ServerInfoUncheckedCreateInput, "serverSessionId">
    >,
  ): Promise<ServerInfo> {
    return this.prisma.serverInfo.update({
      where: { serverSessionId },
      data,
    });
  }
}
