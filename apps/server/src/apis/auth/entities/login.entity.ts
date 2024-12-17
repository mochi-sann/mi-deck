import { ApiProperty, ApiResponse } from "@nestjs/swagger";

export class LoginEntity {
  constructor(data: LoginEntity) {
    this.access_token = data.access_token;
  }
  @ApiProperty()
  access_token: string;
}
