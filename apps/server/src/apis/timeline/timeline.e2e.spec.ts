import {
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TimelineType } from "@prisma/client";
import request from "supertest";
import { setupDatabase } from "test/setup";
import { Mock, afterAll, beforeAll, describe, expect, it, vi } from "vitest"; // Use vi from vitest for mocking
import { AppModule } from "~/app.module";
import { PrismaService } from "~/lib/prisma.service";
import { AuthGuard } from "../auth/auth.gurd";
import { MeEntity } from "../auth/entities/me.entity";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineEntity } from "./entities/timeline.entity";
import { TimelineService } from "./timeline.service"; // Import TimelineService for mocking

describe("TimelineController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let timelineService: TimelineService; // Store TimelineService instance
  let serverSessionId: string; // Store the created server session ID
  let createdTimelineIds: string[] = []; // Store IDs of created timelines for cleanup

  const seededUserId = "f8895928-12d9-47e6-85a3-8de88aaaa7a8"; // Match the ID in prisma/seed.ts
  const mockUser: MeEntity = {
    id: seededUserId,
    email: "example2@example.com",
    name: "hoge",
  };

  beforeAll(async () => {
    await setupDatabase(); // Ensure the user with seededUserId exists

    prisma = new PrismaService(); // Instantiate PrismaService directly for setup

    // Create a ServerSession for the test user before setting up the app
    const serverSession = await prisma.serverSession.create({
      data: {
        userId: seededUserId,
        origin: "https://test.example.com",
        serverType: "Misskey",
        serverToken: "test-token",
      },
    });
    serverSessionId = serverSession.id; // Store the ID

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService) // Ensure the app uses the same Prisma instance if needed, or mock it
      .useValue(prisma)
      .overrideGuard(AuthGuard) // Mock the AuthGuard
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: seededUserId }; // Mock the user object
          return true; // Allow access
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix("v1");
    await app.init();

    // Get the TimelineService instance from the app
    timelineService = moduleFixture.get<TimelineService>(TimelineService);

    // Mock service methods used in GET /timeline/:id
    vi.spyOn(timelineService, "findOne");
    // No need to mock findAllByUserId as we want to test the actual DB interaction via the endpoint
  });

  afterAll(async () => {
    // Clean up created data
    // Delete timelines first due to foreign key constraint
    await prisma.timeline.deleteMany({
      where: { id: { in: createdTimelineIds } },
    });
    await prisma.serverSession.delete({ where: { id: serverSessionId } });
    // Optionally delete the user if it wasn't seeded
    // await prisma.user.delete({ where: { id: seededUserId } });
    await app.close();
    vi.restoreAllMocks(); // Restore all mocks
  });

  describe("POST /v1/timeline", () => {
    it("should create a new timeline configuration", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId, // Use the created server session ID
        name: "Test Home Timeline",
        type: TimelineType.HOME, // Use enum value
      };
      const response = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.serverSessionId).toBe(serverSessionId);
      expect(response.body.name).toBe("Test Home Timeline");
      expect(response.body.type).toBe(TimelineType.HOME);

      // Store the ID for cleanup
      createdTimelineIds.push(response.body.id);
    });

    it("should create a LIST timeline configuration", async () => {
      const createListTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Test List Timeline",
        type: TimelineType.LIST,
        listId: "list-abc-123", // Provide required listId
      };
      const response = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createListTimelineDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.serverSessionId).toBe(serverSessionId);
      expect(response.body.name).toBe("Test List Timeline");
      expect(response.body.type).toBe(TimelineType.LIST);
      expect(response.body.listId).toBe("list-abc-123");

      createdTimelineIds.push(response.body.id);
    });

    it("should return 400 for invalid data (e.g., missing name)", async () => {
      const createTimelineDto = {
        // Missing serverSessionId, name, type
      };
      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(400);
    });

    it("should return 403 if server session does not belong to user", async () => {
      // Although the guard is mocked, the service checks ownership.
      // We test this by trying to create a timeline for a session ID that doesn't exist (or belongs to another user).
      const nonExistentSessionId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: nonExistentSessionId,
        name: "Forbidden Timeline",
        type: TimelineType.HOME,
      };
      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(403); // Service should throw ForbiddenException
    });
  });

  describe("GET /v1/timeline/:serverSessionId", () => {
    const mockNotes = [{ id: "note1", text: "Hello" }];

    it("should return timeline notes for a valid session ID", async () => {
      // Configure the mock for this specific test case
      (timelineService.findOne as Mock).mockResolvedValueOnce(mockNotes);

      const response = await request(app.getHttpServer())
        .get(`/v1/timeline/${serverSessionId}`)
        .expect(200);

      expect(timelineService.findOne).toHaveBeenCalledWith(
        serverSessionId,
        seededUserId,
      );
      expect(response.body).toEqual(mockNotes);
    });

    it("should return 403 if session ID is invalid or not found", async () => {
      const invalidSessionId = "invalid-session-id-123";
      // Configure the mock to throw ForbiddenException for this case
      (timelineService.findOne as Mock).mockRejectedValueOnce(
        new ForbiddenException(
          `Server session with ID ${invalidSessionId} not found or access denied.`,
        ),
      );

      await request(app.getHttpServer())
        .get(`/v1/timeline/${invalidSessionId}`)
        .expect(403);

      expect(timelineService.findOne).toHaveBeenCalledWith(
        invalidSessionId,
        seededUserId,
      );
    });
  });

  describe("GET /v1/timeline", () => {
    // Use the timelines created in the POST tests
    it("should return an array of timeline configurations for the authenticated user", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/timeline")
        // No need to send body, auth is handled by guard mock + token if real guard used
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Expecting the two timelines created in the POST tests
      expect(response.body).toHaveLength(createdTimelineIds.length); // Should match the number created

      // Check if the response contains the expected timeline names (order might vary)
      const names = response.body.map((t: TimelineEntity) => t.name);
      expect(names).toContain("Test Home Timeline");
      expect(names).toContain("Test List Timeline");
      // console.log(...[response.body, '👀 [timeline.e2e.spec.ts:215]: response.body'].reverse());

      // Compare structure excluding dynamic fields (id, serverSessionId, createdAt, updatedAt)
      const expectedTimelines = [
        {
          name: "Test Home Timeline",
          type: "HOME",
          listId: null,
          channelId: null,
          serverSession: {
            origin: "https://test.example.com",
            serverType: "Misskey",
            serverToken: "test-token",
          },
        },
        {
          name: "Test List Timeline",
          type: "LIST",
          listId: "list-abc-123",
          channelId: null,
          serverSession: {
            origin: "https://test.example.com",
            serverType: "Misskey",
            serverToken: "test-token",
          },
        },
      ];

      // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
      const transformTimeline = (timeline: any) => ({
        name: timeline.name,
        type: timeline.type,
        listId: timeline.listId,
        channelId: timeline.channelId,
        serverSession: {
          origin: timeline.serverSession.origin,
          serverType: timeline.serverSession.serverType,
          serverToken: timeline.serverSession.serverToken,
        },
      });

      const actualTimelines = response.body.map(transformTimeline);

      // Use expect.arrayContaining to allow for different order
      expect(actualTimelines).toEqual(
        expect.arrayContaining(expectedTimelines),
      );
      // Ensure the lengths match exactly
      expect(actualTimelines.length).toEqual(expectedTimelines.length);
    });
  });

  it("should return an empty array if the user has no timelines", async () => {
    // Delete existing timelines for this test
    await prisma.timeline.deleteMany({});
    createdTimelineIds = []; // Reset the array

    const response = await request(app.getHttpServer())
      .get("/v1/timeline")
      .expect(200);

    expect(response.body).toEqual([]); // Correct assertion for empty array
  });

  // Add test for unauthorized access if AuthGuard mock wasn't used globally
  // it('should return 401 if user is not authenticated', async () => { ... });
});
