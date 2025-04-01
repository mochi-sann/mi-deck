import {
  ExecutionContext,
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

describe("TimelineController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const seededUserId = "f8895928-12d9-47e6-85a3-8de88aaaa7a8"; // Match the ID in prisma/seed.ts
  const expectedUser: MeEntity = {
    id: seededUserId,
    email: "example2@example.com",
    name: "hoge",
  };

  beforeAll(async () => {
    await setupDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard) // Mock the AuthGuard
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          // Mock the user object that the guard would normally add
          request.user = { id: seededUserId }; // Use the ID of the user created in the seed
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // await prisma.timeline.deleteMany();
    // await prisma.serverSession.deleteMany();
    // await prisma.user.deleteMany(); // Clean all users created during tests
    await app.close();
    vi.restoreAllMocks(); // Restore all mocks
  });

  it("/v1/timeline (POST)", async () => {
    const createTimelineDto: CreateTimelineDto = {
      serverSessionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      name: "Test Timeline",
      type: "HOME",
    };
    const singUpResponse = await request(app.getHttpServer())
      .post("/v1/timeline")
      .send(createTimelineDto) // Use the correct endpoint with global prefix
      .expect(201);

    console.log(
      ...[
        singUpResponse.body,
        "👀 [timeline.e2e.spec.ts:74]: singUpResponse.body",
      ].reverse(),
    );
    // Check if the response body has the accessToken property
    expect(singUpResponse.body).toHaveProperty("id");
    expect(singUpResponse.body.serverSessionId).toBe(
      "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    );
    expect(singUpResponse.body.name).toBe("Test Timeline");
    expect(singUpResponse.body.type).toBe("HOME");
  });
});
