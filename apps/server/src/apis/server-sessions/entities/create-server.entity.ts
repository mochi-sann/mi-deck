import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";
import { $Enums, ServerInfo, UserInfo } from "~/generated/prisma";
import { ServerInfoEntity } from "./server-info.entity";
import { ServerUserInfoEntity } from "./server-user-info.entity";

export class CreateServerSessionResponseEntity {
  constructor(data: CreateServerSessionResponseEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.origin = data.origin;
    this.serverToken = data.serverToken;
    this.serverType = data.serverType;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.serverInfo = new ServerInfoEntity(data.serverInfo);
    this.serverUserInfo = new ServerUserInfoEntity(data.serverUserInfo);
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
    format: "uuid",
  })
  userId: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  origin: string;
  @IsString()
  @ApiProperty({
    type: "string",
  })
  serverToken: string;
  @ApiProperty({
    type: "string",
    enum: ["Misskey", "OtherServer"],
  })
  serverType: $Enums.ServerType;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;

  @IsObject()
  @ApiProperty({
    type: ServerInfoEntity,
  })
  serverInfo: ServerInfo;

  @IsObject()
  @ApiProperty({
    type: ServerUserInfoEntity,
  })
  serverUserInfo: UserInfo;
}
