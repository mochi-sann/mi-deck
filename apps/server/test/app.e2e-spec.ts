import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client/extension";
import request from "supertest";
import { beforeAll, beforeEach, describe, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
import { AppModule } from "./../src/app.module";
import { setupDatabase } from "./setup";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  beforeAll(async () => {
    await setupDatabase();

    console.log(
      ...[
        process.env.DATABSE_URL,
        "👀 [app.e2e-spec.ts:19]: process.env.DATABSE_URL",
      ].reverse(),
    );
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    await prisma.$connect();
    // await prisma.user.createMany({
    //   data: [
    //     {
    //       id: "650e8400-e29b-41d4-a716-446655440001",
    //       name: "user1",
    //       authId: "10",
    //       lastSigninAt: new Date(),
    //       gender: "male",
    //       birthdate: new Date(),
    //     },
    //   ],
    // });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});
