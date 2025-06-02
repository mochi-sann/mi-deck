import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signUpSchema, loginSchema } from "../validators/auth.validator";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type {
  LoginResponse,
  MeResponseType,
  JwtPayload,
} from "../types/auth.types";

const authRoutes = new Hono();
const authService = new AuthService();

// POST /api/v1/auth/signup
authRoutes.post("/signup", zValidator("json", signUpSchema), async (c) => {
  const input = c.req.valid("json");
  // NestJSのAuthControllerのsignUpはLoginEntity (accessTokenを持つ) を返しているので合わせる
  const response: LoginResponse = await authService.signUp(input);
  return c.json(response, 201); // 201 Created
});

// POST /api/v1/auth/login
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const input = c.req.valid("json");
  const response: LoginResponse = await authService.login(input);
  return c.json(response); // 200 OK (default)
});

// GET /api/v1/auth/me
authRoutes.get("/me", authMiddleware, async (c) => {
  const userPayload = c.get("user") as JwtPayload;
  // userPayload.sub (userId) は authMiddleware で検証済みのはず
  const userDetails: MeResponseType = await authService.me(userPayload.sub);
  return c.json(userDetails);
});

// POST /api/v1/auth/logout
authRoutes.post(
  "/logout",
  authMiddleware, // ログアウトも認証が必要な操作とする (NestJSのAuthGuardはかかっていないが、user特定のため)
  async (c) => {
    const userPayload = c.get("user") as JwtPayload;
    const response = await authService.logout(userPayload.sub); // ユーザーIDを渡す
    return c.json(response);
  },
);

export default authRoutes;
