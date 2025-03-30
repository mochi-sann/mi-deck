import { config } from "dotenv";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

config({ path: ".env.test" });

const timeout = process.env.PWDEBUG
  ? Number.POSITIVE_INFINITY
  : process.env.CI
    ? 50000
    : 30000;

export default defineConfig({
  test: {
    include: ["**/*.e2e-spec.ts"],
    globals: true,
    root: "./",
    environment: "node",
    testTimeout: timeout,
    hookTimeout: timeout,
    setupFiles: ["./test/setup-e2e.ts"],
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@test": new URL("./test", import.meta.url).pathname,
    },
  },
  plugins: [swc.vite()],
});
