import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class UpdateTimelineOrderDto {
  @ApiProperty({
    description: "An array of timeline IDs in the desired order",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  timelineIds: string[];
}
