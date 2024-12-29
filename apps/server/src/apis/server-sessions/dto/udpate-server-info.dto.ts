import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class UpdateServerInfoDto {
  @IsString()
  @ApiProperty({
    example: "https://example.com",
  })
  origin: string;
}
