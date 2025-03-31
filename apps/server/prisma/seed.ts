import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { userAndLocalMisskey } from "./seed/userAndLocalMisskey";
const options: { environment: { type: "string" } } = {
  environment: { type: "string" },
};
const prisma = new PrismaClient();

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });
  console.log("environment", environment);

  switch (environment) {
    case "production": //　本番環境
      console.log("production");
      break;

    case "development": // development環境
      console.log("development");
      await userAndLocalMisskey();

      break;

    case "local": // local環境
      console.log("local");
      break;

    case "test": // テスト環境
      await userAndLocalMisskey();
      console.log("test");
      break;
    default:
      break;
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
