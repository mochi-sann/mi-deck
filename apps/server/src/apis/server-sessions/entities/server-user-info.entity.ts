import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";
import { UserInfo } from "~/generated/prisma";

export class ServerUserInfoEntity implements Partial<UserInfo> {
  constructor(data: Partial<UserInfo>) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.username = data.username;
      this.avatarUrl = data.avatarUrl;
    }
  }

  @IsString()
  @ApiProperty({ type: "string", format: "uuid" })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", required: false })
  name?: string;

  @IsString()
  @ApiProperty({ type: "string" })
  username: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ type: "string", format: "url", required: false })
  avatarUrl?: string;
}
