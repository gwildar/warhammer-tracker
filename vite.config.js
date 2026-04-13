import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/turner-overdrive/",
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
