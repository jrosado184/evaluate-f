module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "tailwind.config": "./tailwind.config.js",
          },
        },
      ],
      "react-native-reanimated/plugin", // <-- MUST be last in all cases
    ],
    env: {
      production: {
        plugins: [
          "react-native-paper/babel",
          "react-native-reanimated/plugin", // <-- include here too
        ],
      },
    },
  };
};
