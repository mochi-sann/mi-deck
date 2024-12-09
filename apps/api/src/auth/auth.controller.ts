import type { Hono } from "hono";
import type { AuthService } from "./auth.service.js";
import { authMiddleware } from "./auth.middleware.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  initRoute(app: Hono) {
    app.post("/auth/signup", async (ctx) => {
      const { email, password } = await ctx.req.json();

      try {
        const user = await this.authService.register(email, password);
        return ctx.json({ message: "User registered successfully", user });
      } catch (error) {
        return ctx.json({ error: error.message }, 400);
      }
    });
    app.post("/auth/login", async (ctx) => {
      const { email, password } = await ctx.req.json();
      console.log(
        ...[
          { email, password },
          "👀 [auth.controller.ts:21]: {email , password}",
        ].reverse(),
      );

      try {
        const { token } = await this.authService.login(email, password);
        return ctx.json({ message: "Login successful", token });
      } catch (error) {
        return ctx.json({ error: error.message }, 401);
      }
    });
    app.get("/auth/me", authMiddleware, async (ctx) => {
      const user = ctx.get("user");
      return ctx.json({ message: "Protected endpoint", user });
    });
  }
}
