const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

config.resolver.extraNodeModules = {
  tslib: require.resolve("tslib"), // <-- force tslib resolution
};

module.exports = withNativeWind(config, { input: "./global.css" });
