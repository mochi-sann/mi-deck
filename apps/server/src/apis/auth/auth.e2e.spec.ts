import { type ExecutionContext, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
import { AppModule } from "~/app.module"; // Import AppModule instead of AuthModule
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Use AppModule to ensure all providers are available
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
  });

  afterAll(async () => {
    await app.close();
  });

  // Remove redundant beforeEach
  // beforeEach(async () => { ... });

  // Test the /auth/me endpoint
  it("/v1/auth/signUp (POST)", async () => {
    const singUpResponse = await request(app.getHttpServer())
      .post("/v1/auth/signUp")
      .send({
        email: "1@example.com",
        password: "password",
        username: "test user",
      }) // Use the correct endpoint with global prefix
      .expect(200);

    // Check if the response body matches the expected user data
    expect(singUpResponse.body).key("accessToken");

    const loginResponse = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: "1@example.com", password: "password" })
      .expect(200);

    console.log(
      ...[
        loginResponse.body,
        "👀 [auth.e2e.spec.ts:68]: loginResponse.body",
      ].reverse(),
    );
    expect(loginResponse.body).toHaveProperty("accessToken"); // More specific check

    // Extract the access token from the login response
    const accessToken = loginResponse.body.accessToken;

    const meResponse = await request(app.getHttpServer())
      .get("/v1/auth/me")
      // Add the Authorization header with the Bearer token
      .set('Authorization', `Bearer ${accessToken}`)
      // .send({ email: "1@example.com", password: "password" }) // GET request doesn't need send()
      .expect(200);

    // Check the response body for the user's details (excluding password)
    expect(meResponse.body).toEqual(
      expect.objectContaining({
        email: "1@example.com",
        name: "test user",
        // ID is generated, so we just check for its presence and type
        id: expect.any(String),
      }),
    );
  });
});
