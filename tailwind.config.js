/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.js",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
