import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
};

export default createJestConfig(customJestConfig);
