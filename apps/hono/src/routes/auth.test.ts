import { describe, it, expect, beforeEach, afterEach } from "vitest";
import bcrypt from "bcrypt";
import app from "../index"; // Honoアプリケーションインスタンス
import prisma from "../lib/prisma";
import type { LoginResponse, MeResponseType } from "../types/auth.types";
import { UserRole } from "~/generated/prisma";

// データベースクリーンアップ関数
async function cleanupDatabase() {
  // 依存関係を考慮して削除順を決定 (例: ServerSession -> User)
  // 今回はUserのみで十分だが、他のテストでは関連テーブルも考慮
  await prisma.serverSession.deleteMany({}); // Userを参照している可能性のあるものを先に
  await prisma.userInfo.deleteMany({}); // Userを参照している可能性のあるものを先に
  await prisma.userSetting.deleteMany({}); // Userを参照している可能性のあるものを先に
  await prisma.user.deleteMany({});
}

const testUser = {
  email: "test@example.com",
  password: "password123",
  username: "testuser",
};

const testUser2 = {
  email: "test2@example.com",
  password: "password456",
  username: "testuser2",
};

describe("Auth Routes (/api/v1/auth)", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /signup", () => {
    it("should sign up a new user and return an access token", async () => {
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      expect(res.status).toBe(201);
      const body = (await res.json()) as LoginResponse;
      expect(body.accessToken).toBeDefined();

      // DBにユーザーが作成されたか確認
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe(testUser.username);
    });

    it("should return 409 if email already exists", async () => {
      // 最初にユーザーを作成
      await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      // 同じメールアドレスで再度サインアップ
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.message).toBe("このメールアドレスは既に使用されています。");
    });

    it("should return 400 if email is invalid", async () => {
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testUser, email: "invalidemail" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if password is too short", async () => {
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testUser, password: "short" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if username is too short", async () => {
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testUser, username: "us" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testUser.email }), // password と username が欠落
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // テスト用ユーザーを事前に作成
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          name: testUser.username,
          userRole: UserRole.USER,
        },
      });
    });

    it("should login an existing user and return an access token", async () => {
      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as LoginResponse;
      expect(body.accessToken).toBeDefined();
    });

    it("should return 401 if email does not exist", async () => {
      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wrong@example.com",
          password: testUser.password,
        }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 if password is incorrect", async () => {
      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "wrongpassword",
        }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 if email is invalid", async () => {
      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalidemail",
          password: testUser.password,
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /me", () => {
    let accessToken = "";
    let testUserId = "";

    beforeEach(async () => {
      // サインアップしてトークンを取得
      const signupRes = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser2), // ログインテストとユーザーを分ける
      });
      const signupBody = (await signupRes.json()) as LoginResponse;
      accessToken = signupBody.accessToken;

      const dbUser = await prisma.user.findUnique({
        where: { email: testUser2.email },
      });
      if (dbUser) testUserId = dbUser.id;
    });

    it("should return user profile if token is valid", async () => {
      const res = await app.request("/api/v1/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as MeResponseType;
      expect(body.id).toBe(testUserId);
      expect(body.email).toBe(testUser2.email);
      expect(body.name).toBe(testUser2.username);
      expect(body.userRole).toBe(UserRole.USER);
    });

    it("should return 401 if token is missing", async () => {
      const res = await app.request("/api/v1/auth/me", {
        method: "GET",
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await app.request("/api/v1/auth/me", {
        method: "GET",
        headers: { Authorization: "Bearer invalidtoken" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /logout", () => {
    let accessToken = "";

    beforeEach(async () => {
      const signupRes = await app.request("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      const signupBody = (await signupRes.json()) as LoginResponse;
      accessToken = signupBody.accessToken;
    });

    it("should return logout message if token is valid", async () => {
      const res = await app.request("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("ログアウトしました");
    });

    it("should return 401 if token is missing", async () => {
      const res = await app.request("/api/v1/auth/logout", {
        method: "POST",
      });
      expect(res.status).toBe(401);
    });
  });
});
