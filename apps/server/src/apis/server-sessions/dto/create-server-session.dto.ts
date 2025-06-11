import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateServerSessionDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: "https://misskey.io",
    required: true,
  })
  origin: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Misskey",
    required: true,
  })
  serverType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  sessionToken: string;
}
