// .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser", // Use TypeScript parser
  parserOptions: {
    ecmaVersion: 2020, // Allows parsing of modern ECMAScript features
    sourceType: "module", // Allows using import/export
    ecmaFeatures: {
      jsx: true, // Enable JSX if you're using React
    },
  },
  plugins: ["@typescript-eslint", "react", "react-native"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // TypeScript rules
    "plugin:react/recommended",
    "plugin:react-native/all",
  ],
  rules: {
    // Your custom rules
    "react-native/no-unused-styles": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-raw-text": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
