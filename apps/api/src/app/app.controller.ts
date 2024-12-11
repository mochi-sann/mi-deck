import type { Hono } from "hono";
import type { AppService } from "./app.service.js";

export class AppController {
  constructor(private readonly appService: AppService) {}

  initRoutes(app: Hono) {
    app.get("/", (ctx) => ctx.json(this.appService.getHello()));
  }
}
