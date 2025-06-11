import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TimelineRepository } from "./timeline.repository";
import { TimelineService } from "./timeline.service";

describe("TimelineService", () => {
  let service: TimelineService;
  let repository: TimelineRepository;

  const mockTimelineRepository = {
    findServerSessionByIdAndUserId: jest.fn(),
    createTimeline: jest.fn(),
    findAllTimelinesByUserId: jest.fn(),
    updateTimelineOrder: jest.fn(),
    findTimelineByIdAndUserId: jest.fn(),
    deleteTimeline: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        {
          provide: TimelineRepository,
          useValue: mockTimelineRepository,
        },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
    repository = module.get<TimelineRepository>(TimelineRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteTimeline", () => {
    const timelineId = "test-timeline-id";
    const userId = "test-user-id";

    it("should delete timeline successfully", async () => {
      const mockTimeline = {
        id: timelineId,
        name: "Test Timeline",
        type: "HOME",
        serverSessionId: "session-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
        listId: null,
        channelId: null,
      };

      mockTimelineRepository.deleteTimeline.mockResolvedValue(mockTimeline);

      await service.deleteTimeline(timelineId, userId);

      expect(repository.deleteTimeline).toHaveBeenCalledWith(
        timelineId,
        userId,
      );
      expect(repository.deleteTimeline).toHaveBeenCalledTimes(1);
    });

    it("should throw ForbiddenException when timeline not found", async () => {
      const errorMessage = `Timeline with ID ${timelineId} not found or access denied.`;
      mockTimelineRepository.deleteTimeline.mockRejectedValue(
        new ForbiddenException(errorMessage),
      );

      await expect(service.deleteTimeline(timelineId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.deleteTimeline(timelineId, userId)).rejects.toThrow(
        errorMessage,
      );

      expect(repository.deleteTimeline).toHaveBeenCalledWith(
        timelineId,
        userId,
      );
    });

    it("should throw ForbiddenException when timeline belongs to another user", async () => {
      const errorMessage = `Timeline with ID ${timelineId} not found or access denied.`;
      mockTimelineRepository.deleteTimeline.mockRejectedValue(
        new ForbiddenException(errorMessage),
      );

      await expect(service.deleteTimeline(timelineId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(repository.deleteTimeline).toHaveBeenCalledWith(
        timelineId,
        userId,
      );
    });

    it("should log errors and re-throw them", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const unexpectedError = new Error("Database connection failed");

      mockTimelineRepository.deleteTimeline.mockRejectedValue(unexpectedError);

      await expect(service.deleteTimeline(timelineId, userId)).rejects.toThrow(
        "Database connection failed",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting timeline:", {
        timelineId,
        userId,
        error: unexpectedError,
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle concurrent deletion attempts", async () => {
      // First call succeeds
      mockTimelineRepository.deleteTimeline
        .mockResolvedValueOnce({
          id: timelineId,
          name: "Test Timeline",
          type: "HOME",
          serverSessionId: "session-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          listId: null,
          channelId: null,
        })
        // Second call fails (timeline already deleted)
        .mockRejectedValueOnce(
          new ForbiddenException(
            `Timeline with ID ${timelineId} not found or access denied.`,
          ),
        );

      // First deletion should succeed
      await expect(
        service.deleteTimeline(timelineId, userId),
      ).resolves.not.toThrow();

      // Second deletion should fail
      await expect(service.deleteTimeline(timelineId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(repository.deleteTimeline).toHaveBeenCalledTimes(2);
    });
  });

  describe("create", () => {
    it("should throw ForbiddenException when server session not found", async () => {
      const createDto = {
        serverSessionId: "non-existent-session",
        name: "Test Timeline",
        type: "HOME" as const,
      };
      const userId = "test-user-id";

      mockTimelineRepository.findServerSessionByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(service.create(createDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.findServerSessionByIdAndUserId).toHaveBeenCalledWith(
        createDto.serverSessionId,
        userId,
      );
    });
  });

  describe("updateOrder", () => {
    it("should call repository updateTimelineOrder method", async () => {
      const timelineIds = ["id1", "id2", "id3"];
      const userId = "test-user-id";

      mockTimelineRepository.updateTimelineOrder.mockResolvedValue(undefined);

      await service.updateOrder(timelineIds, userId);

      expect(repository.updateTimelineOrder).toHaveBeenCalledWith(
        timelineIds,
        userId,
      );
    });
  });

  describe("findAllByUserId", () => {
    it("should return timeline entities with server session details", async () => {
      const userId = "test-user-id";
      const mockTimelines = [
        {
          id: "timeline1",
          name: "Timeline 1",
          type: "HOME",
          serverSessionId: "session1",
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          listId: null,
          channelId: null,
          serverSession: {
            id: "session1",
            origin: "https://test.example.com",
            serverType: "Misskey",
            userId: userId,
            serverToken: "token123",
          },
        },
      ];

      mockTimelineRepository.findAllTimelinesByUserId.mockResolvedValue(
        mockTimelines,
      );

      const result = await service.findAllByUserId(userId);

      expect(repository.findAllTimelinesByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("serverSession");
      expect(result[0].serverSession).toHaveProperty(
        "origin",
        "https://test.example.com",
      );
    });
  });
});
