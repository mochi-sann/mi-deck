import { ApiProperty } from "@nestjs/swagger";
import { ServerSession, Timeline } from "~/generated/prisma";
import { TimelineEntity } from "./timeline.entity"; // Import the base TimelineEntity

// Define the structure for the serverSession part
class ServerSessionInfo {
  @ApiProperty({ format: "uuid", description: "ID of the server session" })
  id: string;

  @ApiProperty({
    example: "https://misskey.io",
    description: "Origin URL of the server",
  })
  origin: string;

  @ApiProperty({
    enum: ["Misskey", "OtherServer"],
    description: "Type of the server",
  })
  serverType: ServerSession["serverType"]; // Use the enum type from Prisma
  @ApiProperty({ description: "Token for the server session" })
  serverToken: string;
}

// Extend TimelineEntity and add the serverSession property
export class TimelineWithServerSessionEntity extends TimelineEntity {
  @ApiProperty({
    type: ServerSessionInfo,
    description: "Associated server session details",
  })
  serverSession: ServerSessionInfo;

  constructor(timeline: Timeline, serverSession: ServerSessionInfo) {
    super(timeline); // Initialize the base TimelineEntity properties
    this.serverSession = {
      id: serverSession.id,
      origin: serverSession.origin,
      serverType: serverSession.serverType,
      serverToken: serverSession.serverToken,
    };
  }
}
