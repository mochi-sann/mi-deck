import { parseArgs } from "node:util";
import { PrismaClient } from "~/generated/prisma"; // Prisma Client のインポートパスを tsconfig のエイリアスに合わせる
import { userAndLocalMisskey } from "./seed/userAndLocalMisskey";

const options: { environment: { type: "string" } } = {
  environment: { type: "string" },
};
const prisma = new PrismaClient();

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });
  console.log("Hono Seeding for environment:", environment);

  switch (environment) {
    case "production": //　本番環境
      console.log("production (Hono)");
      // 本番用のシード処理があればここに記述
      break;

    case "development": // development環境
      console.log("development (Hono)");
      await userAndLocalMisskey(prisma); // prisma インスタンスを渡す

      break;

    case "local": // local環境
      console.log("local (Hono)");
      // ローカル開発用のシード処理があればここに記述
      break;

    case "test": // テスト環境
      console.log("test (Hono)");
      await userAndLocalMisskey(prisma); // prisma インスタンスを渡す
      break;
    default:
      console.warn(
        `Unknown environment for Hono: ${environment}. No seeding performed.`,
      );
      break;
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during Hono seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
