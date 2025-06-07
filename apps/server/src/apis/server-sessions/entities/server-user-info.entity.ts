import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ServerUserInfoEntity {
  constructor(data: ServerUserInfoEntity) {
    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.avatarUrl = data.avatarUrl;
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
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: "string",
  })
  username: string;

  @IsString()
  @ApiProperty({
    type: "string",
    format: "url",
  })
  avatarUrl: string;
}
