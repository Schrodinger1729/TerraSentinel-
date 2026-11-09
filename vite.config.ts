import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const { API_PORT = "3001" } = loadEnv(mode, ".", "API_");
  const apiTarget = `http://127.0.0.1:${API_PORT}`;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiTarget,
      },
    },
    preview: {
      proxy: {
        "/api": apiTarget,
      },
    },
  };
});
