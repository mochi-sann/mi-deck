import prisma from "../lib/db";
import type { Prisma, ServerInfo, ServerSession } from "~/generated/prisma";

export class ServerSessionsRepository {
  async createServerSession(
    data: Prisma.ServerSessionUncheckedCreateInput,
  ): Promise<ServerSession> {
    return prisma.serverSession.create({ data });
  }

  async findServerSessionsByUserId(userId: string): Promise<ServerSession[]> {
    return prisma.serverSession.findMany({
      where: { userId },
    });
  }

  async findServerSessionById(id: string): Promise<ServerSession | null> {
    return prisma.serverSession.findUnique({
      where: { id },
    });
  }

  async findServerSessionByUserIdAndOrigin(
    userId: string,
    origin: string,
  ): Promise<ServerSession | null> {
    return prisma.serverSession.findUnique({
      where: {
        userId_origin: { userId, origin }, // Hono側のPrisma Clientの命名規則に合わせる (userId_origin)
      },
    });
  }

  async findServerSessionToken(
    userId: string,
    origin: string,
  ): Promise<{ serverToken: string } | null> {
    return prisma.serverSession.findUnique({
      where: {
        userId_origin: { userId, origin }, // Hono側のPrisma Clientの命名規則に合わせる (userId_origin)
      },
      select: { serverToken: true },
    });
  }

  async upsertServerInfo(
    serverSessionId: string,
    data: Omit<Prisma.ServerInfoUncheckedCreateInput, "serverSessionId">,
  ): Promise<ServerInfo> {
    return prisma.serverInfo.upsert({
      where: { serverSessionId },
      update: data,
      create: {
        ...data,
        serverSessionId,
      },
    });
  }
}
