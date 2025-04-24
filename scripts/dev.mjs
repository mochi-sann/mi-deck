import { dirname } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
console.log("node env", process.env.NODE_ENV);

let frontProcess;
let serverProcess;

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

// SIGINT/SIGTERM シグナルを受信したときに両方の子プロセスを終了させる関数
const cleanup = () => {
  console.log(`\n${colors.yellow}Terminating processes...${colors.reset}`);
  if (frontProcess && !frontProcess.killed) {
    // kill(signal, options) の形式で呼び出す
    frontProcess.kill("SIGTERM", { forceKillAfterTimeout: 2000 });
  }
  if (serverProcess && !serverProcess.killed) {
    // kill(signal, options) の形式で呼び出す
    serverProcess.kill("SIGTERM", { forceKillAfterTimeout: 2000 });
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
  // データベースマイグレーションを実行
  console.log(
    `${colors.magenta}${colors.bright}[DB]${colors.reset} Running database migrations...`,
  );
  try {
    await execa("pnpm", ["run", "server", "--", "db:migrate:dev"], {
      cwd: _dirname + "/../",
      stdio: "inherit", // マイグレーションの出力は直接表示
    });
    console.log(
      `${colors.magenta}${colors.bright}[DB]${colors.reset} Database migration completed successfully.`,
    );
  } catch (migrationError) {
    console.error(
      `${colors.red}${colors.bright}[DB ERROR]${colors.reset} Database migration failed:`,
      migrationError,
    );
    cleanup(); // マイグレーション失敗時は他のプロセスも終了
    process.exit(1);
  }

  console.log(
    `${colors.bright}Starting front-end and back-end dev servers...${colors.reset}`,
  );

  // フロントエンドプロセスを起動
  frontProcess = execa("pnpm", ["run", "front", "--", "dev"], {
    cwd: _dirname + "/../",
    stdio: ["inherit", "pipe", "pipe"],
  });

  // バックエンドプロセスを起動
  console.log(
    `${colors.green}${colors.bright}[SERVER]${colors.reset} Starting back-end dev server...`,
  );
  serverProcess = execa("pnpm", ["run", "server", "--", "dev"], {
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
    "SERVER",
    serverProcess.stdout,
    colors.green,
  );
  const serverStderr = createPrefixedLogger(
    "SERVER ERROR",
    serverProcess.stderr,
    colors.red,
  );

  // どちらかのプロセスが終了したら、もう一方も終了させる
  Promise.race([frontProcess, serverProcess]).catch((error) => {
    // エラーで終了した場合 (Ctrl+C 以外)
    if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
      console.error(
        `${colors.red}${colors.bright}A dev server process exited unexpectedly:${colors.reset}`,
        error,
      );
      cleanup(); // 他方のプロセスも終了させる
      process.exit(1); // エラーコードで終了
    }
  });

  // 両方のプロセスが正常に終了するのを待つ (通常は Ctrl+C で中断されるまで実行し続ける)
  await Promise.all([frontProcess, serverProcess]);

  // クリーンアップ
  frontStdout.close();
  frontStderr.close();
  serverStdout.close();
  serverStderr.close();
} catch (error) {
  // execa の起動自体に失敗した場合など
  if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
    console.error(
      `${colors.red}${colors.bright}Error starting dev scripts:${colors.reset}`,
      error,
    );
    cleanup(); // 起動していた可能性のあるプロセスを終了
    process.exit(1);
  }
  // SIGINT/SIGTERM による終了は正常とみなす (エラーログは不要)
}
