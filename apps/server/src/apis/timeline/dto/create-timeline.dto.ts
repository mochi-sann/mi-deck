import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TimelineType } from "@prisma/client"; // This will be valid after prisma generate
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from "class-validator";

export class CreateTimelineDto {
  @IsUUID()
  @ApiProperty({
    description: "The ID of the server session this timeline belongs to",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  serverSessionId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "User-defined name for the timeline",
    example: "My Home Timeline",
  })
  name: string;

  @IsEnum(TimelineType)
  @ApiProperty({
    description: "Type of the timeline",
    enum: TimelineType,
    example: TimelineType.HOME,
  })
  type: TimelineType;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.type === TimelineType.LIST) // Ensure enum value matches Prisma definition
  @IsNotEmpty({
    message: "listId is required when type is LIST",
  })
  @ApiPropertyOptional({
    description: "Required if type is LIST. The ID of the Misskey list.",
    example: "abcdef1234567890",
  })
  listId?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.type === TimelineType.CHANNEL) // Ensure enum value matches Prisma definition
  @IsNotEmpty({
    message: "channelId is required when type is CHANNEL",
  })
  @ApiPropertyOptional({
    description: "Required if type is CHANNEL. The ID of the Misskey channel.",
    example: "ghijkl9876543210",
  })
  channelId?: string;

  // Add other optional fields here if needed for other timeline types
}
