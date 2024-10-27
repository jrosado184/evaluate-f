/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.js.jsx.ts.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      primary: {
        main: "091057",
      },
    },
    extend: {
      fontFamily: {
        "inter-thin": ["Inter-Thin"],
        "inter-regular": ["Inter-Regular"],
        "inter-medium": ["Inter-Medium"],
        "inter-semibold": ["Inter-SemiBold"],
      },
    },
  },
  plugins: [],
};
