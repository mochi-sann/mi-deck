import { Injectable } from "@nestjs/common";
import { Prisma, ServerSession, Timeline } from "~/generated/prisma";
import { PrismaService } from "../../lib/prisma.service"; // Adjust path if necessary

// Define the type for Timeline including selected ServerSession fields
export type TimelineWithServerSessionDetails = Timeline & {
  serverSession: Pick<
    ServerSession,
    "id" | "origin" | "serverType" | "userId" | "serverToken"
  >; // Include userId for validation
};

@Injectable()
export class TimelineRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds a ServerSession by its ID.
   */
  async findServerSessionById(id: string): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: { id },
    });
  }

  /**
   * Finds a ServerSession by its ID and ensures it belongs to the specified user.
   */
  async findServerSessionByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ServerSession | null> {
    return this.prisma.serverSession.findUnique({
      where: {
        id: id,
        userId: userId, // Ensure the session belongs to the user
      },
    });
  }

  /**
   * Creates a new Timeline record.
   */
  async createTimeline(
    data: Prisma.TimelineUncheckedCreateInput,
  ): Promise<Timeline> {
    return this.prisma.timeline.create({ data });
  }

  /**
   * Finds all Timelines associated with a given userId, including server session details.
   */
  async findAllTimelinesByUserId(
    userId: string,
  ): Promise<TimelineWithServerSessionDetails[]> {
    return this.prisma.timeline.findMany({
      where: {
        serverSession: {
          userId: userId, // Filter by the userId on the related ServerSession
        },
      },
      include: {
        // Include necessary fields from the related ServerSession
        serverSession: {
          select: {
            id: true,
            origin: true,
            serverType: true,
            userId: true, // Include userId to ensure correct association
            serverToken: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  async updateTimelineOrder(
    timelineIds: string[],
    userId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const timelines = await prisma.timeline.findMany({
        where: {
          id: { in: timelineIds },
          serverSession: { userId },
        },
        select: { id: true },
      });

      if (timelines.length !== timelineIds.length) {
        throw new Error("One or more timelines not found or access denied.");
      }

      const updates = timelineIds.map((id, index) =>
        prisma.timeline.update({
          where: { id },
          data: { order: index },
        }),
      );

      await Promise.all(updates);
    });
  }
}
