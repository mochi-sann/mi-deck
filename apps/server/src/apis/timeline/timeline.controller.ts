import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { UpdateTimelineDto } from "./dto/update-timeline.dto";
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

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTimelineDto: UpdateTimelineDto,
  ) {
    return this.timelineService.update(+id, updateTimelineDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.timelineService.remove(+id);
  }
}
