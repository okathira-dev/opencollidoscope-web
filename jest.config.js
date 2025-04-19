/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  rootDir: "./src",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  passWithNoTests: true,
};
