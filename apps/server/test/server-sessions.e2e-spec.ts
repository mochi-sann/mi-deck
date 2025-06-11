import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/lib/prisma.service";

describe("ServerSessionsController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // テスト用のユーザーを作成し、トークンを取得
    const email = `test-user-${Date.now()}@example.com`;
    const password = "password";
    const userResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password, name: "Test User" });
    userId = userResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it("/POST server-sessions", async () => {
    // Mock Misskey API calls
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            token: "mock-misskey-token",
            user: { id: "misskey-user-id" },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            name: "Misskey Server",
            iconUrl: "https://example.com/icon.png",
            faviconUrl: "https://example.com/favicon.ico",
            themeColor: "#ff0000",
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            name: "Misskey User",
            username: "misskeyuser",
            avatarUrl: "https://example.com/avatar.png",
          }),
        ),
      );

    const response = await request(app.getHttpServer())
      .post("/server-sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "https://example.com",
        serverType: "Misskey",
        sessionToken: "mock-session-token",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.origin).toBe("https://example.com");
  });

  it("/GET server-sessions", async () => {
    const response = await request(app.getHttpServer())
      .get("/server-sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    const session = response.body[0];
    expect(session).toHaveProperty("serverInfo");
    expect(session.serverInfo.name).toBe("Misskey Server");
    expect(session).toHaveProperty("serverUserInfo");
    expect(session.serverUserInfo.name).toBe("Misskey User");
  });

  it("/POST server-sessions/update-server-info", async () => {
    const newServerName = "Updated Server Name";
    const response = await request(app.getHttpServer())
      .post("/server-sessions/update-server-info")
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "https://example.com",
        name: newServerName,
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newServerName);
  });
});
