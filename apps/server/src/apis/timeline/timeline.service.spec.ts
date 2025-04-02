import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma, ServerSession, Timeline, TimelineType } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { PrismaService } from "~/lib/prisma.service";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineEntity } from "./entities/timeline.entity";
import { TimelineService } from "./timeline.service";

describe("TimelineService", () => {
  let service: TimelineService;
  let prismaMock: DeepMockProxy<PrismaService>;

  const mockUserId = "user-123";
  const mockServerSessionId = "session-abc";
  const mockServerSession: ServerSession = {
    id: mockServerSessionId,
    userId: mockUserId,
    origin: "https://example.com",
    serverType: "Misskey",
    serverToken: "token",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeline1: Timeline = {
    id: "timeline-1",
    serverSessionId: mockServerSessionId,
    name: "Home",
    type: TimelineType.HOME,
    listId: null,
    channelId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeline2: Timeline = {
    id: "timeline-2",
    serverSessionId: mockServerSessionId,
    name: "List Timeline",
    type: TimelineType.LIST,
    listId: "list-xyz",
    channelId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const createDto: CreateTimelineDto = {
      serverSessionId: mockServerSessionId,
      name: "New Timeline",
      type: TimelineType.HOME,
    };

    it("should create a timeline successfully", async () => {
      prismaMock.serverSession.findUnique.mockResolvedValue(mockServerSession);
      prismaMock.timeline.create.mockResolvedValue(mockTimeline1); // Use mockTimeline1 as example return

      const result = await service.create(createDto, mockUserId);

      expect(prismaMock.serverSession.findUnique).toHaveBeenCalledWith({
        where: { id: mockServerSessionId },
      });
      expect(prismaMock.timeline.create).toHaveBeenCalledWith({
        data: {
          serverSessionId: createDto.serverSessionId,
          name: createDto.name,
          type: createDto.type,
          listId: createDto.listId,
          channelId: createDto.channelId,
        },
      });
      expect(result).toBeInstanceOf(TimelineEntity);
      expect(result.id).toBe(mockTimeline1.id);
    });

    it("should throw ForbiddenException if server session not found", async () => {
      prismaMock.serverSession.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.timeline.create).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException if server session does not belong to user", async () => {
      const otherUserSession = { ...mockServerSession, userId: "other-user" };
      prismaMock.serverSession.findUnique.mockResolvedValue(otherUserSession);

      await expect(service.create(createDto, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.timeline.create).not.toHaveBeenCalled();
    });
  });

  describe("findAllByUserId", () => {
    it("should return an array of timelines for the user", async () => {
      const mockTimelines = [mockTimeline1, mockTimeline2];
      // Mock the response for findMany, including the nested relation check
      prismaMock.timeline.findMany.mockResolvedValue(
        mockTimelines.map((t) => ({
          ...t,
          serverSession: mockServerSession, // Include the related server session
        })) as unknown as Prisma.PrismaPromise<
          (Timeline & { serverSession: ServerSession })[]
        >, // Adjust type hint
      );

      const result = await service.findAllByUserId(mockUserId);

      expect(prismaMock.timeline.findMany).toHaveBeenCalledWith({
        where: {
          serverSession: {
            userId: mockUserId,
          },
        },
        include: {
          serverSession: true,
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(TimelineEntity);
      expect(result[0].id).toBe(mockTimeline1.id);
      expect(result[1].id).toBe(mockTimeline2.id);
    });

    it("should return an empty array if the user has no timelines", async () => {
      prismaMock.timeline.findMany.mockResolvedValue([]);

      const result = await service.findAllByUserId(mockUserId);

      expect(prismaMock.timeline.findMany).toHaveBeenCalledWith({
        where: {
          serverSession: {
            userId: mockUserId,
          },
        },
        include: {
          serverSession: true,
        },
      });
      expect(result).toHaveLength(0);
    });
  });

  // Keep findOne tests if they exist, or add them similarly
  // describe('findOne', () => { ... });
});
