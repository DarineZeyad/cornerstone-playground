import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/cornerstone-playground/",
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/healthcare-api": {
        target: "https://healthcare.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/healthcare-api/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader("Authorization", req.headers.authorization);
            }
          });
        },
      },
    },
  },
});
