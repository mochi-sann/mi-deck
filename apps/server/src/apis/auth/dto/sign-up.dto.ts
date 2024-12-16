import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SignUpDto {
  @IsEmail()
  @ApiProperty({
    example: "example@example.com",
  })
  email: string;
  @IsString()
  @ApiProperty({ example: "password" })
  password: string;
  @IsString()
  @ApiProperty({ example: "username" })
  username: string;
}
