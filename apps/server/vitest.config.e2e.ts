import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const timeout = process.env.PWDEBUG
  ? Number.POSITIVE_INFINITY
  : process.env.CI
    ? 50000
    : 30000;

export default defineConfig({
  test: {
    include: ["**/*.e2e-spec.ts"],
    globals: true,
    root: ".",
    testTimeout: timeout,
    hookTimeout: timeout,
  },
  plugins: [
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
  ],
});
