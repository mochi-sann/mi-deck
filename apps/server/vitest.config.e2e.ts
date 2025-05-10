import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
// import { config } from "dotenv";

// config({ path: ".env.test" }); // Use dotenvx in root package.json instead

const timeout = process.env.PWDEBUG
  ? Number.POSITIVE_INFINITY
  : process.env.CI
    ? 50000
    : 30000;

export default defineConfig({
  test: {
    include: ["**/*.e2e.spec.ts"],
    globals: true,
    root: "./",
    environment: "node",
    testTimeout: timeout,
    hookTimeout: timeout,
    globalSetup: ['./test/setup.ts'], // globalSetupでDBセットアップを実行
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@test": new URL("./test", import.meta.url).pathname,
    },
    poolOptions: { // スレッド/プロセスプールの設定
      threads: {
        singleThread: true, // E2EテストではDBの競合を避けるためシングルスレッドを推奨
        // minThreads: 1, // singleThread: true と同じ効果
        // maxThreads: 1,
      },
      // nodeTargets: { // Vitest v1.0以降で `threads` が非推奨になった場合の代替
      //   singleProcess: true,
      // }
    },
  },
  plugins: [
    // @ts-expect-error - swc types mismatch
    swc.vite({ module: { type: "es6" } }), // Add swc plugin for NestJS compilation
  ],
});
