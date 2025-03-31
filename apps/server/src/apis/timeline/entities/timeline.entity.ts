import { ApiProperty } from "@nestjs/swagger";
import { Timeline, TimelineType } from "@prisma/client";

export class TimelineEntity implements Timeline {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ format: "uuid" })
  serverSessionId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: TimelineType })
  type: TimelineType;

  @ApiPropertyOptional()
  listId: string | null;

  @ApiPropertyOptional()
  channelId: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt: Date;

  @ApiProperty({ format: "date-time" })
  updatedAt: Date;

  constructor(partial: Partial<TimelineEntity>) {
    Object.assign(this, partial);
  }
}
