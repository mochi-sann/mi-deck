// id: string;
// email: string;
// name: string;

import { ApiProperty } from "@nestjs/swagger";

// これをエンティティーにしてください
export class MeEntity {
  constructor(data: MeEntity) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
  }
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
}
