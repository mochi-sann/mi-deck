import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";
import { ServerInfo } from "~/generated/prisma";

export class ServerInfoEntity implements Partial<ServerInfo> {
  constructor(data: Partial<ServerInfo>) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.iconUrl = data.iconUrl;
      this.faviconUrl = data.faviconUrl;
      this.themeColor = data.themeColor;
    }
  }

  @IsString()
  @ApiProperty({ type: "string", format: "uuid" })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ type: "string", format: "url", required: false })
  iconUrl?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ type: "string", format: "url", required: false })
  faviconUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", required: false })
  themeColor?: string;
}
