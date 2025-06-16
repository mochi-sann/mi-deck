import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "lib/main/main.ts"),
        },
      },
    },
    resolve: {
      alias: {
        "@/app": resolve(__dirname, "app"),
        "@/lib": resolve(__dirname, "lib"),
        "@/resources": resolve(__dirname, "resources"),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, "lib/preload/preload.ts"),
        },
      },
    },
    resolve: {
      alias: {
        "@/app": resolve(__dirname, "app"),
        "@/lib": resolve(__dirname, "lib"),
        "@/resources": resolve(__dirname, "resources"),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: "./app",
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "app/index.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "app"),
        "@/app": resolve(__dirname, "app"),
        "@/lib": resolve(__dirname, "lib"),
        "@/resources": resolve(__dirname, "resources"),
      },
    },
    plugins: [
      tsconfigPaths({ root: "./app" }),
      TanStackRouterVite({
        autoCodeSplitting: true,
        routesDirectory: resolve(__dirname, "app/routes"),
      }),
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: process.env.SERVER_ENDPOINT || "http://localhost:3001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});
