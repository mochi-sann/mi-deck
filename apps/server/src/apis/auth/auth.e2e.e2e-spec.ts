import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client/extension";
import request from "supertest";
import { setupDatabase } from "test/setup";
import { beforeAll, beforeEach, describe, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
import { AuthModule } from "./auth.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  beforeAll(async () => {
    await setupDatabase();
    prisma = new PrismaClient();
    await prisma.user.createMany({
      data: [
        {
          id: "650e8400-e29b-41d4-a716-446655440001",
          name: "user1",
          authId: "10",
          lastSigninAt: new Date(),
          gender: "male",
          birthdate: new Date(),
        },
      ],
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          // httpリクエストからコンテキストを作成
          request.user = { id: "650e8400-e29b-41d4-a716-446655440001" };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AuthModule],
  //   }).compile();
  //
  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});
