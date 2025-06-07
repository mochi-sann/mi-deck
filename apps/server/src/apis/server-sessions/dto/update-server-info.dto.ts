import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateServerInfoDto {
  @IsString()
  @ApiProperty({
    example: "https://example.com",
    required: true,
  })
  origin: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: "My Server",
    required: false,
  })
  name?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    example: "https://example.com/icon.png",
    required: false,
  })
  iconUrl?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    example: "https://example.com/favicon.png",
    required: false,
  })
  faviconUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: "#ffffff",
    required: false,
  })
  themeColor?: string;
}
