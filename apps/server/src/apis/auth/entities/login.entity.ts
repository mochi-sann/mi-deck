import { ApiProperty } from "@nestjs/swagger";

export class LoginEntity {
  constructor(data: LoginEntity) {
    this.accessToken = data.accessToken;
  }
  @ApiProperty()
  accessToken: string;
}
