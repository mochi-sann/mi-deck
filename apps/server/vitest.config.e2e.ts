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
    setupFiles: ["./test/setup.ts"], // Corrected setup file path
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@test": new URL("./test", import.meta.url).pathname,
    },
  },
  plugins: [
    // @ts-expect-error - swc types mismatch
    swc.vite(), // Add swc plugin for NestJS compilation
  ],
});
