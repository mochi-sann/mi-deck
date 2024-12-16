import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule, {});
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
