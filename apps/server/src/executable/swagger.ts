import cp from "node:child_process";
import express from "express";

const PORT = 3005;
const execute = (command: string): void => {
  console.log(`\n$ ${command}\n`);
  cp.execSync(command, { stdio: "inherit" });
};

const main = async (): Promise<void> => {
  if (!process.argv.some((str) => str === "--skipBuild"))
    execute("npm run build:swagger");

  // biome-ignore lint: disable any
  const docs = await import("../../packages/api/swagger.json" as any);

  const app = express();
  const swaggerUi = require("swagger-ui-express");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(docs));
  app.listen(PORT);

  console.log("\n");
  console.log("-----------------------------------------------------------");
  console.log(`\n Swagger UI Address: http://localhost:${PORT}/api-docs \n`);
  console.log("-----------------------------------------------------------");
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
