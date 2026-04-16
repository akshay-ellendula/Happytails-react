export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!src/**/*.test.js"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
