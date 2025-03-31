import { type ExecutionContext, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { setupDatabase } from "test/setup";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
import { AppModule } from "~/app.module"; // Import AppModule instead of AuthModule
import { MeEntity } from "./entities/me.entity";

// Use a more descriptive name for the test suite
describe("AuthController (e2e)", () => {
  let app: INestApplication;
  // let prisma: PrismaService; // Get from moduleFixture if needed

  // Define the expected user based on seed data
  const seededUserId = "f8895928-12d9-47e6-85a3-8de88aaaa7a8"; // Match the ID in prisma/seed.ts
  const expectedUser: MeEntity = {
    id: seededUserId,
    email: "example2@example.com",
    name: "hoge",
  };

  beforeAll(async () => {
    await setupDatabase();
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

    // Check if the response body has the accessToken property
    expect(singUpResponse.body).toHaveProperty("accessToken");
  });

  // Test the /auth/login endpoint
  it("/v1/auth/login (POST)", async () => {
    // Use the credentials from the signUp test
    const loginResponse = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: "1@example.com", password: "password" })
      .expect(200);

    // Check if the response body has the accessToken property
    expect(loginResponse.body).toHaveProperty("accessToken");
  });

  // Test the /auth/me endpoint
  it("/v1/auth/me (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/auth/me")
      .expect(200);

    // Check if the response body matches the expected user data
    expect(response.body).toEqual(expectedUser);
  });
});
