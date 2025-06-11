import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";
import {
  $Enums,
  ServerInfo,
  ServerSession,
  UserInfo,
} from "~/generated/prisma";
import { ServerInfoEntity } from "./server-info.entity";
import { ServerUserInfoEntity } from "./server-user-info.entity";

export class CreateServerSessionResponseEntity
  implements Partial<ServerSession>
{
  constructor(
    data: Partial<
      ServerSession & { serverInfo?: ServerInfo; serverUserInfo?: UserInfo }
    >,
  ) {
    if (data) {
      this.id = data.id;
      this.userId = data.userId;
      this.origin = data.origin;
      this.serverToken = data.serverToken;
      this.serverType = data.serverType;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;

      if (data.serverInfo) {
        this.serverInfo = new ServerInfoEntity(data.serverInfo);
      }
      if (data.serverUserInfo) {
        this.serverUserInfo = new ServerUserInfoEntity(data.serverUserInfo);
      }
    }
  }

  @IsString()
  @ApiProperty({ type: "string", format: "uuid" })
  id: string;

  @IsString()
  @ApiProperty({ type: "string", format: "uuid" })
  userId: string;

  @IsString()
  @ApiProperty({ type: "string" })
  origin: string;

  @IsString()
  @ApiProperty({ type: "string" })
  serverToken: string;

  @ApiProperty({ enum: ["Misskey", "OtherServer"] })
  serverType: $Enums.ServerType;

  @ApiProperty({ type: "string", format: "date-time" })
  createdAt: Date;

  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt: Date;

  @IsObject()
  @IsOptional()
  @ApiProperty({ type: () => ServerInfoEntity, required: false })
  serverInfo?: ServerInfoEntity;

  @IsObject()
  @IsOptional()
  @ApiProperty({ type: () => ServerUserInfoEntity, required: false })
  serverUserInfo?: ServerUserInfoEntity;
}
