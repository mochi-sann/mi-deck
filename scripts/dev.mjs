import { execa } from "execa";

let frontProcess;
let serverProcess;

// SIGINT/SIGTERM シグナルを受信したときに両方の子プロセスを終了させる関数
const cleanup = () => {
  console.log("\nTerminating processes...");
  if (frontProcess) {
    frontProcess.kill("SIGTERM", {
      forceKillAfterTimeout: 2000, // 2秒後に強制終了
    });
  }
  if (serverProcess) {
    serverProcess.kill("SIGTERM", {
      forceKillAfterTimeout: 2000, // 2秒後に強制終了
    });
  }
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

try {
  console.log("Starting front-end dev server...");
  frontProcess = execa("pnpm", ["run", "front", "--", "dev"], {
    stdio: "inherit",
  });

  console.log("Starting back-end dev server...");
  serverProcess = execa("pnpm", ["run", "server", "--", "dev"], {
    stdio: "inherit",
  });

  // どちらかのプロセスが終了したら、もう一方も終了させる
  Promise.race([frontProcess, serverProcess]).catch((error) => {
    // エラーで終了した場合 (Ctrl+C 以外)
    if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
      console.error("A dev server process exited unexpectedly:", error);
      cleanup(); // 他方のプロセスも終了させる
      process.exit(1); // エラーコードで終了
    }
  });

  // 両方のプロセスが正常に終了するのを待つ (通常は Ctrl+C で中断されるまで実行し続ける)
  await Promise.all([frontProcess, serverProcess]);

} catch (error) {
  // execa の起動自体に失敗した場合など
  if (error.signal !== "SIGINT" && error.signal !== "SIGTERM") {
    console.error("Error starting dev scripts:", error);
    cleanup(); // 起動していた可能性のあるプロセスを終了
    process.exit(1);
  }
  // SIGINT/SIGTERM による終了は正常とみなす (エラーログは不要)
}
