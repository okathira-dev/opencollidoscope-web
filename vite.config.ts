import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  base: "./",
  root,
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        index: resolve(root, "index.html"),
      },
    },
  },
});
