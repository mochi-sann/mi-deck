import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ServerInfoEntity {
  constructor(data: ServerInfoEntity) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.serverSessionId = data.serverSessionId;
    this.softwareName = data.softwareName;
    this.softwareVersion = data.softwareVersion;
    this.iconUrl = data.iconUrl;
    this.faviconUrl = data.faviconUrl;
    this.themeColor = data.themeColor;
  }
  @IsString()
  @ApiProperty({
    type: "string",
    format: "uuid",
  })
  id: string;
  @IsString()
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  @IsString()
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  name: string;
  @IsString()
  @ApiProperty({
    type: "string",
    format: "uuid",
  })
  serverSessionId: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  softwareName: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  softwareVersion: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  iconUrl: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  faviconUrl: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  themeColor: string;
}
