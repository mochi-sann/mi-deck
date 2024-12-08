import { Hono } from "hono";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

export class AuthModule {
  constructor(private readonly app: Hono) {}

  init() {
    const authService = new AuthService();
    const authController = new AuthController(authService);

    // ルーティングの設定
    authController.login(this.app);
    authController.signUp(this.app);
  }
}
