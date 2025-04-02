import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { TimelineEntity } from "./entities/timeline.entity";
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
    type: [TimelineEntity], // Indicate it returns an array of TimelineEntity
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@Request() req) {
    const userId = req.user.id;
    // TODO: Implement findAllByUserId in TimelineService
    // return this.timelineService.findAllByUserId(userId);
    // Placeholder until service method is implemented:
    return this.timelineService.findAllByUserId(userId); // Assuming this method will be added
  }

  // Existing endpoint to get notes (currently home timeline) for a specific timeline configuration
  // Consider changing the path parameter if it should be timeline ID instead of session ID
  @Get(":serverSessionId") // Or perhaps :timelineId ?
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get timeline notes for a specific server session",
    summary: "Get timeline notes for a specific server session", // Or specific timeline?
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
