import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AppModule } from "./app/app.module.js";

const app = new Hono().basePath("/v1");
export const JWT_SECRET = process.env.JWT_SECRET || ("DEV_SERCRET" as const);

const port = Number(process.env.PORT) || 3001;
const appModule = new AppModule(app);
appModule.init();
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
