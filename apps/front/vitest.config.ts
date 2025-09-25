/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts", // React Testing Library の拡張マッチャーなどを設定する場合
    include: ["src/**/*.test.{ts,tsx}"],
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
      "@test": new URL("./test", import.meta.url).pathname,
      // Ensure misskey-js resolves in tests without depending on package exports
      "misskey-js": new URL(
        "./src/test/__mocks__/misskey-js.ts",
        import.meta.url,
      ).pathname,
      "misskey-js/api.js": new URL(
        "./src/test/__mocks__/misskey-js-api.ts",
        import.meta.url,
      ).pathname,
      "misskey-js/built/api": new URL(
        "./src/test/__mocks__/misskey-js-api.ts",
        import.meta.url,
      ).pathname,
    },
    // reporters: ["default", "html"], // オプション: テストレポートをHTMLで出力する場合
    // coverage: { // オプション: カバレッジを取得する場合
    //   provider: "v8",
    //   reporter: ["text", "json", "html"],
    // },
  },
});
