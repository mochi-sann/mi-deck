import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import routesApp from "./routes.js";

const port = 3002;
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
// Use the middleware to serve Swagger UI at /ui
app.route("/", routesApp);
app.get(
  "/doc",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [
        { url: `http://localhost:${port}`, description: "Local Server" },
      ],
    },
  }),
);
app.get("/doc/ui", swaggerUI({ url: "/doc" }));

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
