import { execa } from "execa";

try {
  // pnpm -r run dev を実行し、出力を現在のプロセスにパイプする
  const subprocess = execa("pnpm", ["-r", "run", "dev"], {
    stdio: "inherit", // 標準入出力/エラーを親プロセスに接続
  });

  // Ctrl+C などでスクリプトが終了した場合にサブプロセスも終了させる
  process.on("SIGINT", () => {
    subprocess.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    subprocess.kill("SIGTERM");
  });

  // サブプロセスの終了を待つ
  await subprocess;
} catch (error) {
  console.error("Error executing dev script:", error);
  process.exit(1);
}
