import type { Hono } from "hono";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login(app: Hono) {
    app.post("/auth/login", async (ctx) => {
      const { username, password } = await ctx.req.json();

      // ここで認証処理を行う (例: ユーザーDBチェック)
      if (username === "user" && password === "password") {
        const token = this.authService.generateToken({ username });
        return ctx.json({ token });
      }

      return ctx.text("Invalid credentials", 401);
    });
  }
  signUp(app: Hono) {
    app.post("/auth/signup", async (ctx) => {
      const { username, password, email } = await ctx.req.json();

      // ここで認証処理を行う (例: ユーザーDBチェック)
      if (username === "user" && password === "password") {
        const token = this.authService.generateToken({ username });
        return ctx.json({ token });
      }

      return ctx.text("Invalid credentials", 401);
    });
  }
}
