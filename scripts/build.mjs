import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

// エラー発生時にメッセージを表示して終了する関数
const exitWithError = (message, error) => {
  console.error(
    `${colors.red}${colors.bright}[ERROR]${colors.reset} ${message}`,
    error || "",
  );
  process.exit(1);
};

try {
  // データベースマイグレーションを実行 (ビルド前に必要な場合)
  console.log(
    `${colors.magenta}${colors.bright}[DB]${colors.reset} Running database migrations...`,
  );
  try {
    await execa("pnpm", ["run", "server", "--", "db:migrate:deploy"], {
      cwd: _dirname + "/../",
      stdio: "inherit", // マイグレーションの出力は直接表示
    });
    console.log(
      `${colors.magenta}${colors.bright}[DB]${colors.reset} Database migration completed successfully.`,
    );
  } catch (migrationError) {
    exitWithError("Database migration failed:", migrationError);
  }

  console.log(
    `${colors.bright}Starting front-end and back-end build process...${colors.reset}`,
  );

  // フロントエンドのビルド
  console.log(
    `${colors.cyan}${colors.bright}[FRONT]${colors.reset} Building front-end application...`,
  );
  try {
    await execa("pnpm", ["run", "front", "--", "build"], {
      cwd: _dirname + "/../",
      stdio: "inherit", // ビルドの出力は直接表示
    });
    console.log(
      `${colors.cyan}${colors.bright}[FRONT]${colors.reset} Front-end build completed successfully.`,
    );
  } catch (frontBuildError) {
    exitWithError("Front-end build failed:", frontBuildError);
  }

  // バックエンドのビルド
  console.log(
    `${colors.green}${colors.bright}[SERVER]${colors.reset} Building back-end application...`,
  );
  try {
    await execa("pnpm", ["run", "server", "--", "build"], {
      cwd: _dirname + "/../",
      stdio: "inherit", // ビルドの出力は直接表示
    });
    console.log(
      `${colors.green}${colors.bright}[SERVER]${colors.reset} Back-end build completed successfully.`,
    );
  } catch (serverBuildError) {
    exitWithError("Back-end build failed:", serverBuildError);
  }

  console.log(
    `${colors.bright}${colors.green}Build process completed successfully.${colors.reset}`,
  );
  process.exit(0); // 正常終了
} catch (error) {
  // execa の起動自体に失敗した場合など、予期せぬエラー
  exitWithError("An unexpected error occurred during the build process:", error);
}
