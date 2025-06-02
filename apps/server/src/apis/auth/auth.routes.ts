import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";

// 仮の AuthService の型定義 (実際の AuthService の実装に合わせて調整が必要)
// AuthService は NestJS の DI から独立させる必要があります。
interface AuthService {
  login: (email: string, pass: string) => Promise<{ accessToken: string }>;
  register: (email: string, pass: string, username: string) => Promise<{ accessToken: string }>;
  me: (userId: string) => Promise<{ id: string; email: string; name: string }>;
  logout: (userId: string) => Promise<void>; // ログアウトは成功/失敗のみを返す想定
}

// 仮の認証ミドルウェアの型定義 (実際の認証ミドルウェアの実装に合わせて調整)
interface AuthContext {
  Variables: {
    user?: { id: string }; // 認証ミドルウェアがセットするユーザー情報
    prisma: any; // main.ts でセットされる Prisma インスタンス
    authService: AuthService; // authService インスタンス
  };
}

import {
  LoginSchema,
  SignUpSchema,
  LoginResponseSchema,
  MeResponseSchema,
  ErrorSchema,
} from "./auth.schemas";

// AuthService のインスタンス化 (実際には依存関係を解決して生成)
// この部分は、AuthService が Prisma や JWT サービスにどう依存するかに応じて変わります。
// 例: const authService = new AuthService(prismaInstance, jwtServiceInstance);
// ここでは仮のインスタンスとします。
const getAuthService = (prisma: any): AuthService => {
  // 本来はここで AuthService のインスタンスを生成・設定します。
  // 例: return new RealAuthService(prisma, new JwtServiceImpl());
  // 以下はダミー実装です。
  return {
    login: async (email, pass) => {
      console.log("AuthService.login called with:", email, pass);
      if (email === "example2@example.com" && pass === "password") {
        return { accessToken: "dummy-access-token-from-hono" };
      }
      throw new HTTPException(401, { message: "認証に失敗しました" });
    },
    register: async (email, pass, username) => {
      console.log("AuthService.register called with:", email, pass, username);
      // 実際の登録処理 (DBへの保存など)
      // 成功したらトークンを返す
      return { accessToken: "new-dummy-access-token-from-hono" };
    },
    me: async (userId) => {
      console.log("AuthService.me called with userId:", userId);
      return { id: userId, email: "user@example.com", name: "Test User" };
    },
    logout: async (userId) => {
      console.log("AuthService.logout called for userId:", userId);
      // 実際のログアウト処理 (トークンの無効化など)
    },
  };
};


// 認証ミドルウェア (AuthGuard の Hono 版)
// これは JWT ベースの認証を想定した簡単な例です。実際のロジックに合わせてください。
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "認証トークンが必要です" });
  }
  const token = authHeader.substring(7);
  // ここでトークンを検証するロジック (例: jwt.verify)
  // const decoded = verifyToken(token); // 仮
  // if (!decoded || !decoded.sub) {
  //   throw new HTTPException(401, { message: "無効なトークンです" });
  // }
  // c.set("user", { id: decoded.sub }); // ユーザー情報をコンテキストにセット
  if (token === "dummy-access-token-from-hono" || token === "new-dummy-access-token-from-hono") { // ダミー検証
      c.set("user", { id: "dummy-user-id" });
  } else {
      throw new HTTPException(401, { message: "無効なトークンです (dummy)" });
  }
  await next();
};


const authApp = new OpenAPIHono<AuthContext>();

// POST /auth/login
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "ログイン成功",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "認証失敗",
    },
  },
  tags: ["auth"],
});

authApp.openapi(
  loginRoute,
  zValidator("json", LoginSchema, (result, c) => {
    if (!result.success) {
      // zod-validator が自動で400エラーを返すので、ここは通常不要
      // カスタムエラーレスポンスが必要な場合のみ
      return c.json(
        {
          statusCode: 400,
          message: "入力内容に誤りがあります。",
          error: result.error.flatten(),
        },
        400 as StatusCode,
      );
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const authService = getAuthService(c.get("prisma")); // Prismaインスタンスを渡す
    try {
      const result = await authService.login(email, password);
      return c.json(result, 200);
    } catch (e: any) {
      if (e instanceof HTTPException) throw e;
      console.error("Login error:", e);
      throw new HTTPException(500, { message: "ログイン処理中にエラーが発生しました" });
    }
  },
);

// POST /auth/signUp
const signUpRoute = createRoute({
  method: "post",
  path: "/signUp",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignUpSchema,
        },
      },
    },
  },
  responses: {
    201: { // NestJS では 200 OK だったが、リソース作成なので 201 Created がより適切
      content: {
        "application/json": {
          schema: LoginResponseSchema, // 登録後もログイン時と同様のレスポンスを想定
        },
      },
      description: "ユーザー登録成功",
    },
    409: { // メールアドレスのコンフリクト
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "メールアドレスが既に使用されています",
    },
    400: { // バリデーションエラー
      content: {
        "application/json": {
          schema: ErrorSchema, // zValidator が返すエラー構造に合わせるか、カスタムエラー
        },
      },
      description: "入力内容に誤りがあります",
    },
  },
  tags: ["auth"],
});

authApp.openapi(
  signUpRoute,
  zValidator("json", SignUpSchema), // バリデーションミドルウェア
  async (c) => {
    const { email, password, username } = c.req.valid("json");
    const authService = getAuthService(c.get("prisma"));
    try {
      // ここでメールアドレスの重複チェックなどを AuthService 内で行う想定
      const result = await authService.register(email, password, username);
      return c.json(result, 201);
    } catch (e: any) {
      if (e instanceof HTTPException) throw e; // AuthService内で適切にHTTPExceptionを投げる
      // 例: if (e.code === 'P2002') { /* Prisma unique constraint error */ throw new HTTPException(409, { message: "メールアドレスが既に使用されています。" }); }
      console.error("SignUp error:", e);
      throw new HTTPException(500, { message: "ユーザー登録処理中にエラーが発生しました" });
    }
  },
);

// GET /auth/me
const meRoute = createRoute({
  method: "get",
  path: "/me",
  security: [{ bearerAuth: [] }], // OpenAPI で Bearer 認証が必要であることを示す
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MeResponseSchema,
        },
      },
      description: "ユーザー情報取得成功",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "認証されていません",
    },
  },
  tags: ["auth"],
});

authApp.openapi(meRoute, authMiddleware, async (c) => { // authMiddleware を適用
  const user = c.get("user");
  if (!user || !user.id) { // authMiddleware でチェックされるが念のため
    throw new HTTPException(401, { message: "認証情報が無効です" });
  }
  const authService = getAuthService(c.get("prisma"));
  try {
    const profile = await authService.me(user.id);
    return c.json(profile, 200);
  } catch (e: any) {
    if (e instanceof HTTPException) throw e;
    console.error("GetProfile error:", e);
    throw new HTTPException(500, { message: "プロフィール取得処理中にエラーが発生しました" });
  }
});

// POST /auth/logout
// ログアウトは成功レスポンス (204 No Content など) を返すのが一般的
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  security: [{ bearerAuth: [] }], // 認証が必要
  responses: {
    204: {
      description: "ログアウト成功",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "認証されていません",
    },
  },
  tags: ["auth"],
});

authApp.openapi(logoutRoute, authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || !user.id) {
    throw new HTTPException(401, { message: "認証情報が無効です" });
  }
  const authService = getAuthService(c.get("prisma"));
  try {
    await authService.logout(user.id);
    return c.body(null, 204); // No Content
  } catch (e: any) {
    if (e instanceof HTTPException) throw e;
    console.error("Logout error:", e);
    throw new HTTPException(500, { message: "ログアウト処理中にエラーが発生しました" });
  }
});

export default authApp;
