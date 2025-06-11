import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.gurd";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { UpdateTimelineOrderDto } from "./dto/update-timeline-order.dto";
import { TimelineEntity } from "./entities/timeline.entity";
import { TimelineWithServerSessionEntity } from "./entities/timelineWithServerSession.entity";
import { TimelineService } from "./timeline.service";

@ApiTags("timeline")
@Controller("timeline")
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new timeline configuration" })
  @ApiResponse({
    status: 201,
    description: "Timeline configuration created successfully.",
    type: TimelineEntity,
  })
  @ApiResponse({ status: 400, description: "Bad Request (validation failed)." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden (user does not own the server session).",
  })
  create(@Body() createTimelineDto: CreateTimelineDto, @Request() req) {
    // req.user is populated by AuthGuard
    const userId = req.user.id;
    return this.timelineService.create(createTimelineDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all timeline configurations for the user" })
  @ApiResponse({
    status: 200,
    description: "Returns an array of timeline configurations.",
    type: [TimelineWithServerSessionEntity], // Indicate it returns an array of TimelineEntity
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@Request() req) {
    const userId = req.user.id;
    return this.timelineService.findAllByUserId(userId);
  }

  @Patch("order")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update the order of timelines" })
  @ApiResponse({
    status: 200,
    description: "Timeline order updated successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request (validation failed or empty array).",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden (timeline not owned by user).",
  })
  updateOrder(
    @Body() updateTimelineOrderDto: UpdateTimelineOrderDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.timelineService.updateOrder(
      updateTimelineOrderDto.timelineIds,
      userId,
    );
  }

  @Delete(":timelineId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a timeline configuration" })
  @ApiResponse({
    status: 204,
    description: "Timeline configuration deleted successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request (invalid UUID format).",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden (timeline not found or access denied).",
  })
  @ApiResponse({ status: 404, description: "Timeline not found." })
  async deleteTimeline(
    @Param("timelineId", ParseUUIDPipe) timelineId: string,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.id;
    return this.timelineService.deleteTimeline(timelineId, userId);
  }

  // Existing endpoint to get notes (currently home timeline) for a specific timeline configuration
  // Consider changing the path parameter if it should be timeline ID instead of session ID
  @Get(":serverSessionId") // Or perhaps :timelineId ?
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get timeline notes for a specific server session",
    description:
      "Fetches notes for a timeline associated with the given server session ID. Needs clarification if it should fetch based on Timeline ID instead.",
  })
  @ApiResponse({
    status: 200,
    description: "Returns an array of notes.",
    // Define a proper type/schema for the notes array if possible
    // For now, using a generic object array
    schema: { type: "array", items: { type: "object" } },
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden (session not found or access denied).",
  })
  findOne(@Param("serverSessionId") serverSessionId: string, @Request() req) {
    console.log(
      ...[
        { serverSessionId, userId: req.user.id },
        "👀 [timeline.controller.ts:61]: serverSessionId",
      ].reverse(),
    );
    // req.user is populated by AuthGuard
    const userId = req.user.id;
    return this.timelineService.findOne(serverSessionId, userId);
  }
}
