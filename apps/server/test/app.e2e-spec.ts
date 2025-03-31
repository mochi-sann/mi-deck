import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
// import { PrismaClient } from "@prisma/client"; // No longer needed directly
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthGuard } from "~/apis/auth/auth.gurd";
import { AppModule } from "./../src/app.module";
// import { PrismaService } from "~/lib/prisma.service"; // Import if needed for setup/teardown
import { setupDatabase } from "./setup";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  // let prisma: PrismaService; // Get from moduleFixture if needed

  beforeAll(async () => {
    // setupDatabase is called globally via vitest config setupFiles

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Example: Override guard if needed for specific tests in this suite
      // .overrideGuard(AuthGuard)
      // .useValue({
      //   canActivate: (context: ExecutionContext) => {
      //     const request = context.switchToHttp().getRequest();
      //     request.user = { id: "some-user-id" }; // Mock user if needed
      //     return true;
      //   },
      // })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get PrismaService instance from the app instance if needed for setup/teardown
    // prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // Remove redundant beforeEach
  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule],
  //   }).compile();
  //
  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  it("/ (GET)", async () => {
    const response = await request(app.getHttpServer()).get("/v1").expect(200); // Note: /v1 prefix is set globally

    expect(response.body).toEqual({ status: "ok" });
  });
});

// Commented out old code for reference:
// describe("AppController (e2e)", () => {
//   let app: INestApplication;
//   let prisma: PrismaClient;
//   beforeAll(async () => {
//     await setupDatabase();
//
//     console.log(
//       ...[
//         process.env.DATABSE_URL,
//         "👀 [app.e2e-spec.ts:19]: process.env.DATABSE_URL",
//       ].reverse(),
//     );
//     prisma = new PrismaClient({
//       datasources: {
//         db: {
//           url: process.env.DATABASE_URL,
//         },
//       },
//     });
//     await prisma.$connect();
//     // await prisma.user.createMany({
//     //   data: [
//     //     {
//     //       id: "650e8400-e29b-41d4-a716-446655440001",
//     //       name: "user1",
//     //       authId: "10",
//     //       lastSigninAt: new Date(),
//     //       gender: "male",
//     //       birthdate: new Date(),
//     //     },
//     //   ],
//     // });
//
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     })
//       .overrideGuard(AuthGuard)
//       .useValue({
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         canActivate: (context: ExecutionContext) => {
//           const request = context.switchToHttp().getRequest();
//           // httpリクエストからコンテキストを作成
//           request.user = { id: "650e8400-e29b-41d4-a716-446655440001" };
//           return true;
//         },
//       })
//       .compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });
//
//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });
//
//   it("/ (GET)", () => {
//     return request(app.getHttpServer())
//       .get("/")
//       .expect(200)
//       .expect("Hello World!");
//   });
// });
