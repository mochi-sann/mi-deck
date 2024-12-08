import type { Hono } from "hono";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login(app: Hono) {
    app.post("/auth/login", async (ctx) => {
      const { email, password } = await ctx.req.json();

      try {
        const user = await this.authService.register(email, password);
        return ctx.json({ message: "User registered successfully", user });
      } catch (error) {
        return ctx.json({ error: error.message }, 400);
      }
    });
    app.post("/auth/signup", async (ctx) => {
      const { email, password } = await ctx.req.json();

      try {
        const { token } = await this.authService.login(email, password);
        return ctx.json({ message: "Login successful", token });
      } catch (error) {
        return ctx.json({ error: error.message }, 401);
      }
    });
  }
}
