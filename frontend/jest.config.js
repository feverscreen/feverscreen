const esModules = ["cptv-player"].join("|");
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.node.json",
      useESM: true
    }
  }
};

