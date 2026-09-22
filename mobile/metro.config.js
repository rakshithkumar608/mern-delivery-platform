const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves modern package formats seamlessly
config.resolver.sourceExts = Array.from(
  new Set([...config.resolver.sourceExts, "mjs", "cjs"])
);

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
