import { Controller, HttpCode, Injectable } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("server-sessions")
@ApiTags("server-sessions")
@Injectable()
export class ServersessionsController {
  @HttpCode(201)
  create() {
    return "This action adds a new server-session";
  }

  getList() {}
  update() {}
  delete() {}
}
