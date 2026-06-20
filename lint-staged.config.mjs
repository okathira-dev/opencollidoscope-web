export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["biome check", () => "tsc --noEmit"],
  "*.{md,mdx,mdc}": "markdownlint-cli2",
};
