import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";

export class CreateServerSessionDto {
  @IsString()
  @ApiProperty({
    example: "example.com",
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
