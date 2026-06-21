import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["test/setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      passWithNoTests: false,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        reportsDirectory: "../coverage",
      },
    },
  }),
);
