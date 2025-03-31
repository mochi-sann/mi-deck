import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TimelineType } from "@prisma/client";
import { APIClient } from "misskey-js/api.js";
import { PrismaService } from "~/lib/prisma.service";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineEntity } from "./entities/timeline.entity";

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  // Method to create a timeline configuration
  async create(
    createTimelineDto: CreateTimelineDto,
    userId: string,
  ): Promise<TimelineEntity> {
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

  // Existing method to fetch notes from a Misskey timeline (e.g., Home timeline)
  // Consider renaming or creating specific methods if fetching different timeline types is needed here.
  async findOne(serverSessionId: string, userId: string) {
    const serverSession = await this.prisma.serverSession.findUnique({
      where: {
        id: id,
      },
    });
    console.log(
      ...[
        serverSession,
        "👀 [timeline.service.ts:19]: serverSession",
      ].reverse(),
    );
    const client = new APIClient({
      origin: serverSession.origin,
      credential: serverSession.serverToken,
    });
    const Timeline = await client
      .request("notes/timeline", {
        limit: 100,
      })
      .then((res) => res)
      .catch((err) => {
        console.log(err);
        throw new UnauthorizedException("can not get server info");
      });
    console.log(Timeline);

    return Timeline;
  }
}
