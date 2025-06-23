import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsconfigPaths from "vite-tsconfig-paths";

const showAnayler = process.env.BUNDLE_ANALYZE === "true";
const IsDev = process.env.NODE_ENV === "development";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({ root: "./" }),
    TanStackRouterVite({ autoCodeSplitting: true, routesDirectory: "./app" }),
    viteReact(),
    tailwindcss(),
    // analyzer がprocess.env.BUNDLE_ANALYZEがある場合にのみ実行される
    analyzer({
      analyzerMode: showAnayler ? "server" : "json",
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
