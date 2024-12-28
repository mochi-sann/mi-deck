import * as fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { dump } from "js-yaml";
import { AppModule } from "./app.module";
import { PORT } from "./lib/env";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
    {
      cors: false,
      logger: ["error", "warn", "log"],
    },
  );
  app.setGlobalPrefix("v1");
  const options = new DocumentBuilder()
    .setTitle("mi-deck api")
    .setDescription("mi-deck api description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document);

  app.use(
    "/api-docs",
    apiReference({
      withFastify: true,
      spec: {
        content: document,
      },
    }),
  );
  console.log(`Server is running on http://localhost:${PORT}`);
  fs.writeFileSync("./.swagger/swagger-spec.yaml", dump(document, {}));
  await app.listen(PORT);
}
bootstrap();
