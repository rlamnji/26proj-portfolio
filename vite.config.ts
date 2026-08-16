import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE || "/",
  build: {
    outDir: "dist",
    // three / drei 를 따로 떼어 초기 로딩 청크를 줄인다
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("three") ||
              id.includes("@react-three/fiber") ||
              id.includes("@react-three/drei")
            ) {
              return "three";
            }

            if (id.includes("framer-motion")) {
              return "motion";
            }
          }

          return undefined;
        },
      },
    },
  },
});
