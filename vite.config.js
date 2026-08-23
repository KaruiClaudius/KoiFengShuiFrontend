import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader(
              "Cross-Origin-Opener-Policy",
              "same-origin-allow-popups"
            );
            next();
          });
        },
      },
    ],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://localhost:7285",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
