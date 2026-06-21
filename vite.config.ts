import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

const crossOriginIsolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

function coiServiceWorkerPlugin(): Plugin {
  const filePath = resolve(__dirname, "node_modules/coi-serviceworker/coi-serviceworker.min.js");

  return {
    name: "coi-serviceworker",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/coi-serviceworker.min.js") {
          res.setHeader("Content-Type", "application/javascript");
          res.end(readFileSync(filePath, "utf-8"));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "coi-serviceworker.min.js",
        source: readFileSync(filePath, "utf-8"),
      });
    },
  };
}

export default defineConfig({
  base: "./",
  root,
  plugins: [react(), coiServiceWorkerPlugin()],
  server: {
    headers: crossOriginIsolationHeaders,
  },
  preview: {
    headers: crossOriginIsolationHeaders,
  },
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
