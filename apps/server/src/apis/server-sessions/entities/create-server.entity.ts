import { ApiProperty } from "@nestjs/swagger";
import type { $Enums } from "@prisma/client";
import { IsString } from "class-validator";

export class CreateServerSessionResponseEntity {
  constructor(data: CreateServerSessionResponseEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.origin = data.origin;
    this.serverToken = data.serverToken;
    this.serverType = data.serverType;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
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
}
