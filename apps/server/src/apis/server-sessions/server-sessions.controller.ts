import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { CreateServerSessionDto } from "./dto/creste.dto";
import { CreateServerSessionResponseEntity } from "./entities/create-server.entity";
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
    type: CreateServerSessionResponseEntity,
  })
  @ApiResponse({
    status: 401,
  })
  async create(@Body() body: CreateServerSessionDto, @Request() req) {
    const user = req.user;
    return await this.serverSessionsService.create(body, user.id);
  }

  @Get()
  @ApiResponse({
    status: 201,
    type: [CreateServerSessionResponseEntity],
  })
  @ApiResponse({
    status: 401,
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getList(@Request() req) {
    const userId = req.user.id;
    return await this.serverSessionsService.getList(userId);
  }
  @Put(":id")
  update() {}
  @Delete(":id")
  delete() {}
}
