import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    environment: "node",
    include: ["**/*.spec.ts"],
    exclude: ["**/*.e2e-spec.ts", "node_modules"],
    setupFiles: ["./test/setup.ts"],
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@test": new URL("./test", import.meta.url).pathname
    }
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
