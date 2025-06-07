import { Injectable } from "@nestjs/common";
import { Prisma, ServerInfo, ServerSession } from "~/generated/prisma";
import { PrismaService } from "../../lib/prisma.service";

@Injectable()
export class ServerSessionsRepository {
  constructor(private prisma: PrismaService) {}

  async createServerSession(
    data: Prisma.ServerSessionCreateInput,
  ): Promise<ServerSession> {
    return this.prisma.serverSession.create({ data });
  }

  async findServerSessionsByUserId(userId: string): Promise<ServerSession[]> {
    return this.prisma.serverSession.findMany({
      where: { userId },
    });
  }

  async findServerSessionById(id: string): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: { id },
    });
  }

  async findServerSessionByUserIdAndOrigin(
    userId: string,
    origin: string,
  ): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention: Prisma constraint name
        origin_userId: { userId, origin },
      },
    });
  }

  async findServerSessionToken(
    userId: string,
    origin: string,
  ): Promise<{ serverToken: string } | null> {
    return this.prisma.serverSession.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention: Prisma constraint name
        origin_userId: { userId, origin },
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
