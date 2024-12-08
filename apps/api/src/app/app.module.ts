import { Hono } from "hono";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

export class AppModule {
  constructor(private readonly app: Hono) {}

  init() {
    const appService = new AppService();
    const appController = new AppController(appService);

    // ルーティングの設定
    appController.initRoutes(this.app);
  }
}
