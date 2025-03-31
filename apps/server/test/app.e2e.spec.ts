import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  // let prisma: PrismaService; // Get from moduleFixture if needed

  beforeAll(async () => {
    // setupDatabase is called globally via vitest config setupFiles

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/ (GET)", async () => {
    const response = await request(app.getHttpServer()).get("/").expect(200); // Note: /v1 prefix is set globally

    expect(response.body).toEqual({ status: "ok" });
  });
});
