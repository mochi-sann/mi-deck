import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TimelineController } from "./timeline.controller";
import { TimelineService } from "./timeline.service";

describe("TimelineController", () => {
  let controller: TimelineController;
  let service: TimelineService;

  const mockTimelineService = {
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    updateOrder: jest.fn(),
    deleteTimeline: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimelineController],
      providers: [
        {
          provide: TimelineService,
          useValue: mockTimelineService,
        },
      ],
    }).compile();

    controller = module.get<TimelineController>(TimelineController);
    service = module.get<TimelineService>(TimelineService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("deleteTimeline", () => {
    it("should delete timeline successfully", async () => {
      const timelineId = "test-timeline-id";
      const mockReq = { user: { id: "user-id" } };

      mockTimelineService.deleteTimeline.mockResolvedValue(undefined);

      await controller.deleteTimeline(timelineId, mockReq);

      expect(service.deleteTimeline).toHaveBeenCalledWith(
        timelineId,
        "user-id",
      );
    });

    it("should throw ForbiddenException when timeline not found", async () => {
      const timelineId = "non-existent-timeline-id";
      const mockReq = { user: { id: "user-id" } };

      mockTimelineService.deleteTimeline.mockRejectedValue(
        new ForbiddenException("Timeline not found or access denied."),
      );

      await expect(
        controller.deleteTimeline(timelineId, mockReq),
      ).rejects.toThrow(ForbiddenException);

      expect(service.deleteTimeline).toHaveBeenCalledWith(
        timelineId,
        "user-id",
      );
    });
  });
});
