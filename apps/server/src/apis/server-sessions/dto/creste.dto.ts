import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateServerSessionDto {
  @IsString()
  @ApiProperty({
    example: "https://example.com",
  })
  origin: string;
  @IsUUID()
  @ApiProperty({
    type: "string",
  })
  sessionToken: string;
  @ApiProperty({})
  @IsString()
  serverType: string;
}
