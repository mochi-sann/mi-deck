import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsUUID } from "class-validator";

export class UpdateTimelineOrderDto {
  @ApiProperty({
    description: "An array of timeline IDs in the desired order",
    type: [String],
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "456e7890-e89b-12d3-a456-426614174001",
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: "At least one timeline ID is required" })
  @IsUUID(4, { each: true, message: "Each timeline ID must be a valid UUID" })
  timelineIds: string[];
}
