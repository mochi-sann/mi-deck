import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { ServerSession } from "~/generated/prisma";
// PrismaService is removed as it's now used in the repository
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineEntity } from "./entities/timeline.entity";
import {
  TimelineRepository,
  TimelineWithServerSessionDetails,
} from "./timeline.repository"; // Import the repository and type

// Define the return type including selected server session fields for the service response
type TimelineWithServerSessionResponse = TimelineEntity & {
  serverSession: Pick<ServerSession, "id" | "origin" | "serverType">;
};

@Injectable()
export class TimelineService {
  // Inject the repository instead of PrismaService
  constructor(private timelineRepository: TimelineRepository) {}

  // Method to create a timeline configuration
  async create(
    createTimelineDto: CreateTimelineDto,
    userId: string,
  ): Promise<TimelineEntity> {
    // 1. Verify the server session belongs to the user using the repository
    const serverSession =
      await this.timelineRepository.findServerSessionByIdAndUserId(
        createTimelineDto.serverSessionId,
        userId,
      );

    if (!serverSession) {
      // Use NotFoundException or ForbiddenException based on whether you want to reveal existence
      throw new ForbiddenException(
        `Server session with ID ${createTimelineDto.serverSessionId} not found or access denied.`,
      );
    }

    // 2. Create the timeline configuration in the database using the repository
    const newTimeline = await this.timelineRepository.createTimeline({
      serverSessionId: createTimelineDto.serverSessionId,
      name: createTimelineDto.name,
      type: createTimelineDto.type,
      listId: createTimelineDto.listId, // Will be null if not provided or not applicable
      channelId: createTimelineDto.channelId, // Will be null if not provided or not applicable
    });

    return new TimelineEntity(newTimeline);
  }

  // Method to find all timeline configurations for a user
  async findAllByUserId(
    userId: string,
  ): Promise<TimelineWithServerSessionResponse[]> {
    // Use repository to find timelines
    const timelines: TimelineWithServerSessionDetails[] =
      await this.timelineRepository.findAllTimelinesByUserId(userId);

    // Map repository results to the service response structure
    return timelines.map((timeline) => {
      // The repository already returns the necessary serverSession fields
      return {
        ...new TimelineEntity(timeline), // Create TimelineEntity from the timeline part
        serverSession: {
          // Map the selected serverSession fields
          id: timeline.serverSession.id,
          origin: timeline.serverSession.origin,
          serverType: timeline.serverSession.serverType,
          serverToken: timeline.serverSession.serverToken, // Include serverToken if needed
        },
      };
    });
  }

  async updateOrder(timelineIds: string[], userId: string): Promise<void> {
    await this.timelineRepository.updateTimelineOrder(timelineIds, userId);
  }

  // Method to delete a timeline configuration
  async deleteTimeline(timelineId: string, userId: string): Promise<void> {
    try {
      await this.timelineRepository.deleteTimeline(timelineId, userId);
    } catch (error) {
      console.error("Error deleting timeline:", {
        timelineId,
        userId,
        error,
      });

      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  // Existing method to fetch notes from a Misskey timeline (e.g., Home timeline)
  // This method fetches notes based on a SERVER SESSION ID.
  // It verifies ownership before proceeding.
  async findOne(serverSessionId: string, userId: string) {
    // Use repository to find the server session and verify ownership
    const serverSession =
      await this.timelineRepository.findServerSessionByIdAndUserId(
        serverSessionId,
        userId,
      );

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
    let timelineNotes: Note[];
    try {
      timelineNotes = await client.request("notes/timeline", {
        limit: 100, // Example limit
      });
    } catch (err) {
      console.error("Error fetching timeline notes:", {
        origin: serverSession.origin,
        serverSessionId,
        userId,
        error: err,
      });

      // Handle different types of Misskey API errors
      if (err && typeof err === "object" && "code" in err) {
        const misskeyError = err as {
          code: string;
          message?: string;
          id?: string;
        };

        switch (misskeyError.code) {
          case "RATE_LIMIT_EXCEEDED":
            throw new UnauthorizedException(
              `Rate limit exceeded for ${serverSession.origin}. Please try again later.`,
            );
          case "INVALID_TOKEN":
          case "CREDENTIAL_REQUIRED":
            throw new UnauthorizedException(
              `Invalid or expired token for ${serverSession.origin}. Please re-authenticate.`,
            );
          case "SUSPENDED":
            throw new ForbiddenException(
              `Account suspended on ${serverSession.origin}.`,
            );
          case "BLOCKED":
            throw new ForbiddenException(
              `Access blocked on ${serverSession.origin}.`,
            );
          default:
            throw new UnauthorizedException(
              `API error from ${serverSession.origin}: ${misskeyError.message || misskeyError.code}`,
            );
        }
      }

      // Handle network errors
      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("network")) {
          throw new UnauthorizedException(
            `Network error connecting to ${serverSession.origin}. Server may be unreachable.`,
          );
        }
        if (err.message.includes("timeout")) {
          throw new UnauthorizedException(
            `Timeout error connecting to ${serverSession.origin}. Server is taking too long to respond.`,
          );
        }
      }

      // Generic fallback error
      throw new UnauthorizedException(
        `Could not fetch timeline notes from ${serverSession.origin}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
    console.log(timelineNotes);

    return timelineNotes; // Returns the array of notes
  }
}
