/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  setupFiles: ["<rootDir>/src/__test_utils__/electronMocks.js"],
};

module.exports = config;
