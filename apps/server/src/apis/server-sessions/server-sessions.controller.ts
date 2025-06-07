import {
  Body,
  Controller,
  Get,
  HttpCode,
  Injectable,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { CreateServerSessionDto } from "./dto/creste.dto";
import { UpdateServerInfoDto } from "./dto/update-server-info.dto";
import { CreateServerSessionResponseEntity } from "./entities/create-server.entity";
import { ServerInfoEntity } from "./entities/server-info.entity";
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

  @Post("update-server-info")
  @ApiResponse({
    status: 201,
    type: ServerInfoEntity,
  })
  @ApiResponse({
    status: 401,
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateServerInfo(@Request() req, @Body() body: UpdateServerInfoDto) {
    const userId = req.user.id;
    const serverSession =
      await this.serverSessionsService.getServerSessionfromUseridAndOrigin(
        userId,
        body.origin,
      );
    return await this.serverSessionsService.updateServerInfo(
      serverSession.id,
      body,
    );
    // console.log(
    //   ...[
    //     serverSession,
    //     "👀 [server-sessions.controller.ts:75]: serverSession",
    //   ].reverse(),
    // );
    // return await this.serverSessionsService.updateOrCreateServerInfo(
    //   serverSession.id,
    //   body.origin,
    //   userId,
    // );
  }
}
