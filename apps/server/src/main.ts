import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { PORT } from "./lib/env.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false,
    logger: ["error", "warn", "log", "debug", "verbose"],
  });
  const options = new DocumentBuilder()
    .setTitle("mi-deck api")
    .setDescription("mi-deck api description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document);
  console.log(`Server is running on http://localhost:${PORT}`);
  await app.listen(PORT);
}
bootstrap();
