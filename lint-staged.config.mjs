export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "biome check",
    () => "tsc --noEmit",
    (filenames) => {
      const sourceFiles = filenames.filter(
        (file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"),
      );

      if (sourceFiles.length === 0) {
        return [];
      }

      return `vitest related --run ${sourceFiles.join(" ")}`;
    },
  ],
  "*.{md,mdx,mdc}": "markdownlint-cli2",
};
