import { dirname } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
console.log("node env", process.env.NODE_ENV);

let frontProcess;
let serverProcess;
let honoProcess; // Honoプロセス用の変数を追加

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
  purple: "\x1b[35m", // Hono用に色を追加 (magentaと同じでも良い)
};

// SIGINT/SIGTERM シグナルを受信したときにすべての子プロセスを終了させる関数
const cleanup = () => {
  console.log(`\n${colors.yellow}Terminating processes...${colors.reset}`);
  if (frontProcess && !frontProcess.killed) {
    frontProcess.kill("SIGTERM", { forceKillAfterTimeout: 2000 });
  }
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM", { forceKillAfterTimeout: 2000 });
  }
  if (honoProcess && !honoProcess.killed) { // Honoプロセスも終了
    honoProcess.kill("SIGTERM", { forceKillAfterTimeout: 2000 });
  }
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// 出力にカラー付きのプレフィックスを付けるためのユーティリティ関数
const createPrefixedLogger = (prefix, stream, prefixColor) => {
  const rl = createInterface({ input: stream });
  rl.on("line", (line) => {
    console.log(
      `${prefixColor}${colors.bright}[${prefix}]${colors.reset} ${line}`,
    );
  });
  return rl;
};

try {
  // データベースマイグレーションを実行 (NestJS Server用)
  console.log(
    `${colors.magenta}${colors.bright}[DB (NestJS)]${colors.reset} Running database migrations for NestJS server...`,
  );
  try {
    await execa("pnpm", ["run", "server", "--", "db:migrate:dev"], {
      cwd: _dirname + "/../",
      stdio: "inherit",
    });
    console.log(
      `${colors.magenta}${colors.bright}[DB (NestJS)]${colors.reset} Database migration for NestJS server completed successfully.`,
    );
  } catch (migrationError) {
    console.error(
      `${colors.red}${colors.bright}[DB ERROR (NestJS)]${colors.reset} Database migration for NestJS server failed:`,
      migrationError,
    );
    cleanup();
    process.exit(1);
  }

  // データベースマイグレーションを実行 (Hono用)
  console.log(
    `${colors.purple}${colors.bright}[DB (Hono)]${colors.reset} Running database migrations for Hono server...`,
  );
  try {
    // Honoプロジェクトのpnpmスクリプトを実行
    await execa("pnpm", ["run", "hono", "--", "db:migrate:dev"], {
      cwd: _dirname + "/../",
      stdio: "inherit",
    });
    console.log(
      `${colors.purple}${colors.bright}[DB (Hono)]${colors.reset} Database migration for Hono server completed successfully.`,
    );
    // Honoプロジェクトのpnpmスクリプトでseedも実行
    await execa("pnpm", ["run", "hono", "--", "db:seed", "--environment=development"], {
      cwd: _dirname + "/../",
      stdio: "inherit",
    });
     console.log(
      `${colors.purple}${colors.bright}[DB (Hono)]${colors.reset} Database seeding for Hono server completed successfully.`,
    );
  } catch (migrationError) {
    console.error(
      `${colors.red}${colors.bright}[DB ERROR (Hono)]${colors.reset} Database migration or seeding for Hono server failed:`,
      migrationError,
    );
    cleanup();
    process.exit(1);
  }


  console.log(
    `${colors.bright}Starting front-end, NestJS back-end, and Hono back-end dev servers...${colors.reset}`,
  );

  // フロントエンドプロセスを起動
  frontProcess = execa("pnpm", ["run", "front", "--", "dev"], {
    cwd: _dirname + "/../",
    stdio: ["inherit", "pipe", "pipe"],
  });

  // NestJSバックエンドプロセスを起動
  console.log(
    `${colors.green}${colors.bright}[SERVER (NestJS)]${colors.reset} Starting NestJS back-end dev server...`,
  );
  serverProcess = execa("pnpm", ["run", "server", "--", "dev"], {
    cwd: _dirname + "/../",
    stdio: ["inherit", "pipe", "pipe"],
  });

  // Honoバックエンドプロセスを起動
  console.log(
    `${colors.blue}${colors.bright}[SERVER (Hono)]${colors.reset} Starting Hono back-end dev server...`,
  );
  honoProcess = execa("pnpm", ["run", "hono", "--", "dev"], { // Hono用のdevスクリプト
    cwd: _dirname + "/../",
    stdio: ["inherit", "pipe", "pipe"],
  });


  // 各プロセスの出力にカラー付きプレフィックスを付ける
  const frontStdout = createPrefixedLogger(
    "FRONT",
    frontProcess.stdout,
    colors.cyan,
  );
  const frontStderr = createPrefixedLogger(
    "FRONT ERROR",
    frontProcess.stderr,
    colors.yellow,
  );
  const serverStdout = createPrefixedLogger(
    "SERVER (NestJS)",
    serverProcess.stdout,
    colors.green,
  );
  const serverStderr = createPrefixedLogger(
    "SERVER ERROR (NestJS)",
    serverProcess.stderr,
    colors.red,
  );
  const honoStdout = createPrefixedLogger( // Hono用ロガー
    "SERVER (Hono)",
    honoProcess.stdout,
    colors.blue,
  );
  const honoStderr = createPrefixedLogger( // Honoエラー用ロガー
    "SERVER ERROR (Hono)",
    honoProcess.stderr,
    colors.magenta, // 別の色を使用
  );

  // いずれかのプロセスが終了したら、他も終了させる
  Promise.race([frontProcess, serverProcess, honoProcess]).catch((error) => {
    if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
      console.error(
        `${colors.red}${colors.bright}A dev server process exited unexpectedly:${colors.reset}`,
        error,
      );
      cleanup();
      process.exit(1);
    }
  });

  // すべてのプロセスが正常に終了するのを待つ
  await Promise.all([frontProcess, serverProcess, honoProcess]);

  // クリーンアップ
  frontStdout.close();
  frontStderr.close();
  serverStdout.close();
  serverStderr.close();
  honoStdout.close(); // Honoロガーも閉じる
  honoStderr.close(); // Honoエラーロガーも閉じる
} catch (error) {
  if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
    console.error(
      `${colors.red}${colors.bright}Error starting dev scripts:${colors.reset}`,
      error,
    );
    cleanup();
    process.exit(1);
  }
}
