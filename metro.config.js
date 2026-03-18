const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Point Expo Router to the correct directory
config.resolver.sourceExts.push('mjs');

// 2. Ignore Next.js specific folders and large web-only dirs to speed up bundling
config.resolver.blacklistRE = [
    /src\/app\/.*/,      // Ignore Next.js App Router
    /\.next\/.*/,         // Ignore Next.js build output
];

module.exports = withNativeWind(config, { input: './app/global.css' });
