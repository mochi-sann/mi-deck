import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Post,
  Put,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateServerSessionDto } from "./dto/creste.dto";

@Controller("server-sessions")
@ApiTags("server-sessions")
@Injectable()
export class ServersessionsController {
  @HttpCode(201)
  @Post()
  @ApiResponse({
    status: 201,
  })
  create(@Body() boday: CreateServerSessionDto) {
    return "This action adds a new server-session";
  }

  @Get()
  getList() {}
  @Put(":id")
  update() {}
  @Delete(":id")
  delete() {}
}
