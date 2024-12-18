import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact()],
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
});
