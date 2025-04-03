import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ServerSession } from "@prisma/client";
import { APIClient } from "misskey-js/api.js";
import { PrismaService } from "~/lib/prisma.service";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineEntity } from "./entities/timeline.entity";

// 返り値の型定義を追加
type TimelineWithServerSession = TimelineEntity & {
  serverSession: Pick<ServerSession, "id" | "origin" | "serverType">;
};

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  // Method to create a timeline configuration
  async create(
    createTimelineDto: CreateTimelineDto,
    userId: string,
  ): Promise<TimelineEntity> {
    console.log(
      ...[
        { createTimelineDto: createTimelineDto.serverSessionId, userId },
        "👀 [timeline.service.ts:21]: {createTimelineDto , userId}",
      ].reverse(),
    );

    // 1. Verify the server session belongs to the user
    const serverSession = await this.prisma.serverSession.findUnique({
      where: { id: createTimelineDto.serverSessionId },
    });

    if (!serverSession) {
      throw new ForbiddenException(
        `Server session with ID ${createTimelineDto.serverSessionId} not found.`,
      );
    }

    if (serverSession.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to access server session ${createTimelineDto.serverSessionId}.`,
      );
    }

    // 2. Create the timeline configuration in the database
    const newTimeline = await this.prisma.timeline.create({
      data: {
        serverSessionId: createTimelineDto.serverSessionId,
        name: createTimelineDto.name,
        type: createTimelineDto.type,
        listId: createTimelineDto.listId, // Will be null if not provided or not applicable
        channelId: createTimelineDto.channelId, // Will be null if not provided or not applicable
      },
    });

    return new TimelineEntity(newTimeline);
  }

  // Method to find all timeline configurations for a user
  async findAllByUserId(userId: string): Promise<TimelineEntity[]> {
    const timelines = await this.prisma.timeline.findMany({
      where: {
        serverSession: {
          userId: userId, // Filter timelines based on the user ID of the associated server session
        },
      },
      include: {
        serverSession: true, // Include serverSession to ensure the relation exists
      },
    });

    // Map Prisma models to TimelineEntity objects
    return timelines.map((timeline) => new TimelineEntity(timeline));
  }

  // Existing method to fetch notes from a Misskey timeline (e.g., Home timeline)
  // This method fetches notes based on a SERVER SESSION ID, not a timeline configuration ID.
  // Consider if this should fetch based on a specific TimelineEntity ID instead.
  async findOne(serverSessionId: string, userId: string) {
    const serverSession = await this.prisma.serverSession.findUnique({
      where: {
        id: serverSessionId, // Correctly use the parameter
        userId: userId, // Ensure the user owns the session
      },
    });

    if (!serverSession) {
      // Throw ForbiddenException if the session doesn't exist or doesn't belong to the user
      throw new ForbiddenException(
        `Server session with ID ${serverSessionId} not found or access denied.`,
      );
    }

    console.log(
      ...[
        serverSession,
        "👀 [timeline.service.ts:60]: serverSession", // Line number might change after adding 'create'
      ].reverse(),
    );
    const client = new APIClient({
      origin: serverSession.origin,
      credential: serverSession.serverToken,
    });

    // TODO: This currently fetches 'notes/timeline' (Home).
    // Adapt this based on the *configured* timeline type if needed,
    // or keep it specifically for fetching the home timeline notes.
    // For now, it fetches the home timeline associated with the session.
    const timelineNotes = await client
      .request("notes/timeline", {
        limit: 100, // Example limit
      })
      .then((res) => res)
      .catch((err) => {
        console.error("Error fetching timeline notes:", err);
        // Consider more specific error handling based on Misskey API errors
        throw new UnauthorizedException(
          `Could not fetch timeline notes from ${serverSession.origin}`,
        );
      });
    console.log(timelineNotes);

    return timelineNotes; // Returns the array of notes
  }
}
