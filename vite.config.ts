import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/healthcare-api": {
        target: "https://healthcare.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/healthcare-api/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.authorization) {
              proxyReq.setHeader("Authorization", req.headers.authorization);
            }
          });
        },
      },
    },
  },
});
