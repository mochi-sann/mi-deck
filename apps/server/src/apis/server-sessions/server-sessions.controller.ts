import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { CreateServerSessionDto } from "./dto/creste.dto";
import { ServerSessionsService } from "./server-sessions.service";

@Controller("server-sessions")
@ApiTags("server-sessions")
@Injectable()
export class ServersessionsController {
  constructor(private serverSessionsService: ServerSessionsService) {}
  @HttpCode(201)
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
