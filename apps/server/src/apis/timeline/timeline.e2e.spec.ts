import { TimelineType } from "@prisma/client";
import {
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { setupDatabase } from "test/setup";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"; // Use vi from vitest for mocking
import { AppModule } from "~/app.module";
import { PrismaService } from "~/lib/prisma.service";
import { AuthGuard } from "../auth/auth.gurd";
import { MeEntity } from "../auth/entities/me.entity";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineService } from "./timeline.service"; // Import TimelineService for mocking

describe("TimelineController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let timelineService: TimelineService; // Store TimelineService instance
  let serverSessionId: string; // Store the created server session ID

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

    // Mock the findOne method of TimelineService
    vi.spyOn(timelineService, "findOne");
  });

  afterAll(async () => {
    // Clean up created data
    await prisma.timeline.deleteMany({ where: { serverSessionId } });
    await prisma.serverSession.delete({ where: { id: serverSessionId } });
    // Optionally delete the user if it wasn't seeded: await prisma.user.delete({ where: { id: seededUserId } });
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
    });

    it("should return 400 for invalid data", async () => {
      const createTimelineDto = {
        // Missing serverSessionId, name, type
      };
      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(400);
    });

    it("should return 403 if server session does not belong to user (simulated via service logic)", async () => {
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
      (timelineService.findOne as vi.Mock).mockResolvedValueOnce(mockNotes);

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
      (timelineService.findOne as vi.Mock).mockRejectedValueOnce(
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
});
