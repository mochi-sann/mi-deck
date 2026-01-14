import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import { devtools } from "@tanstack/devtools-vite";

const showAnayler = process.env.BUNDLE_ANALYZE === "true";
const IsDev = process.env.NODE_ENV === "development";
const IsStorybook = process.env.IS_STORYBOOK === "true";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({ root: "./" }),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    IsStorybook && devtools(),
    // analyzer がprocess.env.BUNDLE_ANALYZEがある場合にのみ実行される
    analyzer({
      analyzerMode: showAnayler ? "server" : "json",
    }),
    !IsStorybook &&
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["pwa-icon.svg"],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        manifest: {
          name: "Mi-Deck",
          short_name: "Mi-Deck",
          description: "A modern, feature-rich web client for Misskey.",
          start_url: "/",
          display: "standalone",
          background_color: "#0b0f1a",
          theme_color: "#0b0f1a",
          icons: [
            {
              src: "/pwa-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
      }),
  ],
  esbuild: {
    drop: !IsDev ? ["console", "debugger"] : [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.SERVER_ENDPOINT || "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  optimizeDeps: {
    exclude: ["@mdx-js/react"], // StorybookのVite最適化エラー対策
  },
});
