import {
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { Mock, afterAll, beforeAll, describe, expect, it, vi } from "vitest"; // Use vi from vitest for mocking
import { AppModule } from "~/app.module";
import { TimelineType } from "~/generated/prisma";
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
      // We test this by trying to create a timeline for a session ID that doesn\'t exist (or belongs to another user).
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
      const getAllTimelines = await prisma.timeline.findMany({});

      expect(Array.isArray(response.body)).toBe(true);
      // Expecting the two timelines created in the POST tests
      expect(response.body).toHaveLength(getAllTimelines.length); // Should match the number created

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
    });
  });

  describe("DELETE /v1/timeline/:timelineId", () => {
    let timelineToDeleteId: string;

    beforeAll(async () => {
      // Create a timeline specifically for deletion tests
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Timeline to Delete",
        type: TimelineType.GLOBAL,
      };

      const response = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(201);

      timelineToDeleteId = response.body.id;
      createdTimelineIds.push(timelineToDeleteId);
    });

    it("should delete a timeline successfully", async () => {
      // Verify timeline exists before deletion
      const timelineBefore = await prisma.timeline.findUnique({
        where: { id: timelineToDeleteId },
      });
      expect(timelineBefore).toBeTruthy();

      // Delete the timeline
      await request(app.getHttpServer())
        .delete(`/v1/timeline/${timelineToDeleteId}`)
        .expect(204);

      // Verify timeline no longer exists
      const timelineAfter = await prisma.timeline.findUnique({
        where: { id: timelineToDeleteId },
      });
      expect(timelineAfter).toBeNull();

      // Remove from cleanup array since it's already deleted
      createdTimelineIds = createdTimelineIds.filter(
        (id) => id !== timelineToDeleteId,
      );
    });

    it("should return 403 when trying to delete non-existent timeline", async () => {
      const nonExistentTimelineId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";

      await request(app.getHttpServer())
        .delete(`/v1/timeline/${nonExistentTimelineId}`)
        .expect(403);
    });

    it("should return 400 for invalid timeline ID format", async () => {
      const invalidTimelineId = "invalid-uuid-format";

      await request(app.getHttpServer())
        .delete(`/v1/timeline/${invalidTimelineId}`)
        .expect(400); // Validation should fail for non-UUID format
    });

    it("should not allow deleting timeline belonging to another user", async () => {
      // Create another user and server session
      const anotherUser = await prisma.user.create({
        data: {
          email: "another@example.com",
          password: "hashedpassword",
          name: "Another User",
        },
      });

      const anotherServerSession = await prisma.serverSession.create({
        data: {
          userId: anotherUser.id,
          origin: "https://another.example.com",
          serverType: "Misskey",
          serverToken: "another-token",
        },
      });

      const anotherTimeline = await prisma.timeline.create({
        data: {
          serverSessionId: anotherServerSession.id,
          name: "Another User's Timeline",
          type: TimelineType.HOME,
        },
      });

      try {
        // Try to delete another user's timeline (should fail)
        await request(app.getHttpServer())
          .delete(`/v1/timeline/${anotherTimeline.id}`)
          .expect(403);

        // Verify timeline still exists
        const timelineStillExists = await prisma.timeline.findUnique({
          where: { id: anotherTimeline.id },
        });
        expect(timelineStillExists).toBeTruthy();
      } finally {
        // Cleanup
        await prisma.timeline.delete({ where: { id: anotherTimeline.id } });
        await prisma.serverSession.delete({
          where: { id: anotherServerSession.id },
        });
        await prisma.user.delete({ where: { id: anotherUser.id } });
      }
    });

    it("should handle deletion when timeline has dependencies gracefully", async () => {
      // Create a timeline for this specific test
      const timelineWithDeps = await prisma.timeline.create({
        data: {
          serverSessionId: serverSessionId,
          name: "Timeline with Dependencies",
          type: TimelineType.LOCAL,
        },
      });

      try {
        // Delete the timeline
        await request(app.getHttpServer())
          .delete(`/v1/timeline/${timelineWithDeps.id}`)
          .expect(204);

        // Verify timeline is deleted
        const deletedTimeline = await prisma.timeline.findUnique({
          where: { id: timelineWithDeps.id },
        });
        expect(deletedTimeline).toBeNull();
      } catch (error) {
        // If deletion fails, clean up manually
        await prisma.timeline.delete({ where: { id: timelineWithDeps.id } });
        throw error;
      }
    });
  });

  describe("PATCH /v1/timeline/order", () => {
    const orderTestTimelineIds: string[] = [];

    beforeAll(async () => {
      // Create multiple timelines for order testing
      const timelines = [
        { name: "First Timeline", type: TimelineType.HOME },
        { name: "Second Timeline", type: TimelineType.LOCAL },
        { name: "Third Timeline", type: TimelineType.GLOBAL },
      ];

      for (const timeline of timelines) {
        const response = await request(app.getHttpServer())
          .post("/v1/timeline")
          .send({
            serverSessionId: serverSessionId,
            name: timeline.name,
            type: timeline.type,
          })
          .expect(201);

        orderTestTimelineIds.push(response.body.id);
        createdTimelineIds.push(response.body.id);
      }
    });

    afterAll(async () => {
      // Clean up order test timelines
      await prisma.timeline.deleteMany({
        where: { id: { in: orderTestTimelineIds } },
      });
      // Remove from main cleanup array
      createdTimelineIds = createdTimelineIds.filter(
        (id) => !orderTestTimelineIds.includes(id),
      );
    });

    it("should update timeline order successfully", async () => {
      // Reverse the order
      const newOrder = [...orderTestTimelineIds].reverse();

      await request(app.getHttpServer())
        .patch("/v1/timeline/order")
        .send({ timelineIds: newOrder })
        .expect(200);

      // Verify the new order in database
      const timelinesAfterReorder = await prisma.timeline.findMany({
        where: { id: { in: orderTestTimelineIds } },
        orderBy: { order: "asc" },
      });

      const actualOrder = timelinesAfterReorder.map((t) => t.id);
      expect(actualOrder).toEqual(newOrder);
    });

    it("should return 403 when trying to reorder timeline not owned by user", async () => {
      // Create another user's timeline
      const anotherUser = await prisma.user.create({
        data: {
          email: "ordertest@example.com",
          password: "hashedpassword",
          name: "Order Test User",
        },
      });

      const anotherServerSession = await prisma.serverSession.create({
        data: {
          userId: anotherUser.id,
          origin: "https://ordertest.example.com",
          serverType: "Misskey",
          serverToken: "order-token",
        },
      });

      const anotherTimeline = await prisma.timeline.create({
        data: {
          serverSessionId: anotherServerSession.id,
          name: "Another User's Timeline for Order",
          type: TimelineType.HOME,
        },
      });

      try {
        // Try to include another user's timeline in reorder
        const unauthorizedOrder = [...orderTestTimelineIds, anotherTimeline.id];

        await request(app.getHttpServer())
          .patch("/v1/timeline/order")
          .send({ timelineIds: unauthorizedOrder })
          .expect(403);
      } finally {
        // Cleanup
        await prisma.timeline.delete({ where: { id: anotherTimeline.id } });
        await prisma.serverSession.delete({
          where: { id: anotherServerSession.id },
        });
        await prisma.user.delete({ where: { id: anotherUser.id } });
      }
    });

    it("should return 400 for invalid timeline ID in order array", async () => {
      const invalidOrder = [...orderTestTimelineIds, "invalid-uuid"];

      await request(app.getHttpServer())
        .patch("/v1/timeline/order")
        .send({ timelineIds: invalidOrder })
        .expect(400);
    });

    it("should return 400 for empty timeline order array", async () => {
      await request(app.getHttpServer())
        .patch("/v1/timeline/order")
        .send({ timelineIds: [] })
        .expect(400);
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

  describe("Error Handling and Edge Cases", () => {
    it("should handle concurrent deletion requests gracefully", async () => {
      // Create a timeline for concurrent deletion test
      const timelineResponse = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send({
          serverSessionId: serverSessionId,
          name: "Concurrent Delete Test Timeline",
          type: TimelineType.HOME,
        })
        .expect(201);

      const timelineId = timelineResponse.body.id;
      createdTimelineIds.push(timelineId);

      // Make concurrent deletion requests
      const deletePromises = [
        request(app.getHttpServer()).delete(`/v1/timeline/${timelineId}`),
        request(app.getHttpServer()).delete(`/v1/timeline/${timelineId}`),
        request(app.getHttpServer()).delete(`/v1/timeline/${timelineId}`),
      ];

      const results = await Promise.allSettled(deletePromises);

      // At least one should succeed (204), others should fail (403 or 404)
      const successCount = results.filter(
        (result) =>
          // biome-ignore lint/suspicious/noExplicitAny:
          result.status === "fulfilled" && (result.value as any).status === 204,
      ).length;

      expect(successCount).toBeGreaterThanOrEqual(1);

      // Verify timeline is deleted
      const timelineAfter = await prisma.timeline.findUnique({
        where: { id: timelineId },
      });
      expect(timelineAfter).toBeNull();

      // Remove from cleanup array since it's deleted
      createdTimelineIds = createdTimelineIds.filter((id) => id !== timelineId);
    });

    it("should handle malformed request bodies gracefully", async () => {
      // Test malformed JSON for create timeline
      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send("{ invalid json }")
        .expect(400);

      // Test malformed JSON for order update
      await request(app.getHttpServer())
        .patch("/v1/timeline/order")
        .send("{ invalid json }")
        .expect(400);
    });

    it("should validate timeline type correctly", async () => {
      const invalidTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Invalid Type Timeline",
        type: "INVALID_TYPE", // Invalid enum value
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(invalidTimelineDto)
        .expect(400);
    });

    it("should handle very long timeline names", async () => {
      const longName = "A".repeat(1000); // Very long name
      const longNameDto = {
        serverSessionId: serverSessionId,
        name: longName,
        type: TimelineType.HOME,
      };

      // This might succeed or fail depending on database constraints
      // The important thing is it doesn't crash the server
      const response = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(longNameDto);

      expect([201, 400]).toContain(response.status);

      if (response.status === 201) {
        createdTimelineIds.push(response.body.id);
      }
    });

    it("should handle deletion of timeline that was already deleted externally", async () => {
      // Create a timeline
      const timelineResponse = await request(app.getHttpServer())
        .post("/v1/timeline")
        .send({
          serverSessionId: serverSessionId,
          name: "External Delete Test Timeline",
          type: TimelineType.HOME,
        })
        .expect(201);

      const timelineId = timelineResponse.body.id;

      // Delete it directly via Prisma (simulating external deletion)
      await prisma.timeline.delete({ where: { id: timelineId } });

      // Try to delete via API (should return 403 since timeline doesn't exist)
      await request(app.getHttpServer())
        .delete(`/v1/timeline/${timelineId}`)
        .expect(403);
    });
  });

  // Add test for unauthorized access if AuthGuard mock wasn't used globally
  // it('should return 401 if user is not authenticated', async () => { ... });
});
