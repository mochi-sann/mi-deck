import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { TimelineService } from "./timeline.service";

@ApiTags("timeline")
@Controller("timeline")
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 401,
  })
  @Get(":serverSerssionId")
  findOne(@Param("serverSerssionId") serverSerssionId: string, @Request() req) {
    console.log(
      ...[
        { serverSerssionId, userId: req.user.id },
        "👀 [timeline.controller.ts:32]: ServerSerssionId",
      ].reverse(),
    );
    return this.timelineService.findOne(serverSerssionId, req.user.id);
  }
}
