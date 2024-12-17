import * as fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { dump } from "js-yaml";
import { AppModule } from "./app.module.js";
import { PORT } from "./lib/env.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.setGlobalPrefix("v1");
  const options = new DocumentBuilder()
    .setTitle("mi-deck api")
    .setDescription("mi-deck api description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document);
  console.log(`Server is running on http://localhost:${PORT}`);
  fs.writeFileSync("./.swagger/swagger-spec.yaml", dump(document, {}));
  await app.listen(PORT);
}
bootstrap();
