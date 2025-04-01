import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TimelineType } from "@prisma/client";
import { APIClient } from "misskey-js/api.js"; // Import APIClient for mocking
import * as request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"; // Use vi from vitest for mocking
import { AppModule } from "~/app.module";
import { PrismaService } from "~/lib/prisma.service";
import { AuthService } from "../auth/auth.service";
import { CreateServerSessionDto } from "../server-sessions/dto/creste.dto";
import { ServerSessionsService } from "../server-sessions/server-sessions.service";
import { SignUpUserDto } from "../user/dto/sign-up-user.dto";
import { UserService } from "../user/user.service";
import { CreateTimelineDto } from "./dto/create-timeline.dto";
import { TimelineService } from "./timeline.service"; // Import TimelineService for mocking

describe("TimelineController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let userService: UserService;
  let serverSessionsService: ServerSessionsService;
  let timelineService: TimelineService; // Add TimelineService
  let authToken: string;
  let userId: string;
  let serverSessionId: string;
  let otherUserAuthToken: string;
  let otherUserServerSessionId: string;

  // Mock the APIClient request method
  const mockApiClientRequest = vi.fn();
  vi.mock("misskey-js/api.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      APIClient: vi.fn().mockImplementation(() => ({
        request: mockApiClientRequest,
      })),
    };
  });

  beforeAll(async () => {
    // Mock ServerSessionsService external call *before* module compilation if needed
    // If ServerSessionsService constructor or module init makes calls, mock earlier.
    // Here, we assume the call happens in the 'create' method.

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix("v1");
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    serverSessionsService = moduleFixture.get<ServerSessionsService>(
      ServerSessionsService,
    );
    timelineService = moduleFixture.get<TimelineService>(TimelineService); // Get TimelineService instance

    // Clean database before tests
    await prisma.timeline.deleteMany();
    await prisma.serverSession.deleteMany();
    await prisma.user.deleteMany();

    // --- Create main test user and session ---
    const userDto: SignUpUserDto = {
      email: `timeline-e2e-${Date.now()}@example.com`,
      password: "password123",
      username: `timeline-e2e-${Date.now()}`,
    };
    const user = await userService.create(userDto);
    userId = user.id;
    const loginResponse = await authService.login(userDto.email, userDto.password);
    authToken = loginResponse.accessToken;

    // Mock the external call within ServerSessionsService.create
    // Adjust the method name if 'fetchMisskeyInstanceInfo' is not correct
    const mockFetchInfo = vi
      .spyOn(serverSessionsService as any, "fetchMisskeyInstanceInfo")
      .mockResolvedValue({
        ok: true,
        meta: { name: "Test Instance", iconUrl: null, themeColor: null },
      });

    const createSessionDto: CreateServerSessionDto = {
      origin: "https://test.misskey.io",
      serverType: "Misskey",
      sessionToken: "mockSessionTokenMain",
    };
    const serverSession = await serverSessionsService.create(
      createSessionDto,
      userId,
    );
    serverSessionId = serverSession.id;
    mockFetchInfo.mockRestore(); // Restore original method if needed elsewhere

    // --- Create another user and session for permission tests ---
    const otherUserDto: SignUpUserDto = {
      email: `other-user-${Date.now()}@example.com`,
      password: "password456",
      username: `other-user-${Date.now()}`,
    };
    const otherUser = await userService.create(otherUserDto);
    const otherLoginResponse = await authService.login(
      otherUserDto.email,
      otherUserDto.password,
    );
    otherUserAuthToken = otherLoginResponse.accessToken;

    const mockFetchInfoOther = vi
      .spyOn(serverSessionsService as any, "fetchMisskeyInstanceInfo")
      .mockResolvedValue({
        ok: true,
        meta: { name: "Other Instance", iconUrl: null, themeColor: null },
      });

    const otherCreateSessionDto: CreateServerSessionDto = {
      origin: "https://other.misskey.io",
      serverType: "Misskey",
      sessionToken: "mockSessionTokenOther",
    };
    const otherServerSession = await serverSessionsService.create(
      otherCreateSessionDto,
      otherUser.id, // Associate with the other user
    );
    otherUserServerSessionId = otherServerSession.id;
    mockFetchInfoOther.mockRestore();
  });

  afterAll(async () => {
    await prisma.timeline.deleteMany();
    await prisma.serverSession.deleteMany();
    await prisma.user.deleteMany(); // Clean all users created during tests
    await app.close();
    vi.restoreAllMocks(); // Restore all mocks
  });

  describe("POST /v1/timeline", () => {
    it("should create a new HOME timeline configuration (201)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "My Test Home Timeline",
        type: TimelineType.HOME,
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.name).toEqual(createTimelineDto.name);
          expect(res.body.type).toEqual(TimelineType.HOME);
          expect(res.body.serverSessionId).toEqual(serverSessionId);
          expect(res.body.listId).toBeNull();
          expect(res.body.channelId).toBeNull();
        });
    });

    it("should create a new LIST timeline configuration (201)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "My Test List Timeline",
        type: TimelineType.LIST,
        listId: "testListId123",
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.name).toEqual(createTimelineDto.name);
          expect(res.body.type).toEqual(TimelineType.LIST);
          expect(res.body.serverSessionId).toEqual(serverSessionId);
          expect(res.body.listId).toEqual(createTimelineDto.listId);
          expect(res.body.channelId).toBeNull();
        });
    });

    it("should create a new CHANNEL timeline configuration (201)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "My Test Channel Timeline",
        type: TimelineType.CHANNEL,
        channelId: "testChannelId456",
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.name).toEqual(createTimelineDto.name);
          expect(res.body.type).toEqual(TimelineType.CHANNEL);
          expect(res.body.serverSessionId).toEqual(serverSessionId);
          expect(res.body.listId).toBeNull();
          expect(res.body.channelId).toEqual(createTimelineDto.channelId);
        });
    });

    it("should fail if listId is missing for LIST type (400)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Invalid List Timeline",
        type: TimelineType.LIST,
        // listId is missing
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(400);
    });

    it("should fail if channelId is missing for CHANNEL type (400)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Invalid Channel Timeline",
        type: TimelineType.CHANNEL,
        // channelId is missing
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(400);
    });

    it("should fail without authentication (401)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: serverSessionId,
        name: "Unauthorized Timeline",
        type: TimelineType.HOME,
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .send(createTimelineDto)
        .expect(401);
    });

    it("should fail if serverSessionId does not exist (403)", async () => {
      const nonExistentSessionId = "00000000-0000-0000-0000-000000000000";
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: nonExistentSessionId,
        name: "Timeline for Non-existent Session",
        type: TimelineType.HOME,
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createTimelineDto)
        .expect(403); // Forbidden because session not found for user
    });

    it("should fail if serverSessionId belongs to another user (403)", async () => {
      const createTimelineDto: CreateTimelineDto = {
        serverSessionId: otherUserServerSessionId, // Use session ID of the other user
        name: "Timeline for Other User Session",
        type: TimelineType.HOME,
      };

      await request(app.getHttpServer())
        .post("/v1/timeline")
        .set("Authorization", `Bearer ${authToken}`) // Authenticated as the main user
        .send(createTimelineDto)
        .expect(403); // Forbidden because user doesn't own the session
    });
  });

  describe("GET /v1/timeline/:serverSessionId", () => {
    beforeEach(() => {
      // Reset mocks before each test in this describe block
      mockApiClientRequest.mockClear();
    });

    it("should retrieve timeline notes for a valid session (200)", async () => {
      const mockNotes = [{ id: "note1", text: "Hello world" }];
      mockApiClientRequest.mockResolvedValue(mockNotes); // Mock successful API response

      await request(app.getHttpServer())
        .get(`/v1/timeline/${serverSessionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .then((res) => {
          expect(mockApiClientRequest).toHaveBeenCalledWith("notes/timeline", {
            limit: 100,
          });
          expect(res.body).toEqual(mockNotes);
        });
    });

    it("should fail without authentication (401)", async () => {
      await request(app.getHttpServer())
        .get(`/v1/timeline/${serverSessionId}`)
        .expect(401);
    });

    it("should fail for a non-existent session (403)", async () => {
      const nonExistentSessionId = "00000000-0000-0000-0000-000000000000";
      await request(app.getHttpServer())
        .get(`/v1/timeline/${nonExistentSessionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403); // Forbidden as session not found for user
    });

    it("should fail if user does not own the session (403)", async () => {
      await request(app.getHttpServer())
        .get(`/v1/timeline/${otherUserServerSessionId}`) // Use session ID of the other user
        .set("Authorization", `Bearer ${authToken}`) // Authenticated as the main user
        .expect(403); // Forbidden as user doesn't own the session
    });

    it("should handle errors from the Misskey API (500 or specific error)", async () => {
      const apiError = new Error("Misskey API Error");
      mockApiClientRequest.mockRejectedValue(apiError); // Mock API call failure

      // The service currently throws UnauthorizedException(401) on fetch error.
      // Consider if a 502 Bad Gateway or 500 Internal Server Error might be more appropriate.
      await request(app.getHttpServer())
        .get(`/v1/timeline/${serverSessionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(401); // Expecting 401 based on current service implementation
      // .expect(500); // Or expect 500/502 if you change the service error handling
    });
  });
});
