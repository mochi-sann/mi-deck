import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
// import { PrismaClient } from "@prisma/client"; // No longer needed directly
import request from "supertest";
// import { setupDatabase } from "test/setup"; // Called globally
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
// import { PrismaService } from "~/lib/prisma.service"; // Import if needed
import { AuthModule } from "./auth.module";
import { MeEntity } from "./entities/me.entity";

// Use a more descriptive name for the test suite
describe("AuthController (e2e)", () => {
  let app: INestApplication;
  // let prisma: PrismaService; // Get from moduleFixture if needed

  // Define the expected user based on seed data
  const seededUserId = "650e8400-e29b-41d4-a716-446655440000"; // Match the ID in prisma/seed.ts
  const expectedUser: MeEntity = {
    id: seededUserId,
    email: "test@example.com", // Match the email in prisma/seed.ts
    name: "Test User", // Match the name in prisma/seed.ts
  };

  beforeAll(async () => {
    // setupDatabase is called globally via vitest config setupFiles
    // No need to create data here, seeding handles it.
    // prisma = new PrismaClient(); // Don't instantiate directly
    // await prisma.user.createMany({ ... }); // Remove data creation

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule], // Import AuthModule for auth routes
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
    app.setGlobalPrefix("v1"); // Ensure the global prefix is applied
    await app.init();

    // Get PrismaService instance if needed
    // prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // Remove redundant beforeEach
  // beforeEach(async () => { ... });

  // Test the /auth/me endpoint
  it("/v1/auth/me (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/auth/me") // Use the correct endpoint with global prefix
      .expect(200);

    // Check if the response body matches the expected user data
    expect(response.body).toEqual(expectedUser);
  });
});
