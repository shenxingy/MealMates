// Learn more: https://docs.expo.dev/guides/monorepos/
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, "node_modules", ".cache", "metro"),
  }),
];

// Fix for InternalBytecode.js error
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Prevent metro from trying to read InternalBytecode.js
      if (req.url?.includes("InternalBytecode.js")) {
        res.statusCode = 404;
        res.end();
        return;
      }
      return middleware(req, res, next);
    };
  },
};

// Add custom symbolication to handle missing InternalBytecode.js
config.symbolicator = {
  customizeFrame: (frame) => {
    if (frame && frame.file && frame.file.includes("InternalBytecode.js")) {
      return null; // Skip frames referencing InternalBytecode.js
    }
    return frame;
  },
};

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withNativewind(config);
