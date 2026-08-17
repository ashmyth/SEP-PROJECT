/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBF9F5",
        surface: "#FFFFFF",
        "surface-subtle": "#F7F5F0",
        border: "#E7E5E0",
        "border-subtle": "#F0EDE6",
        ink: {
          900: "#1C1917",
          800: "#292524",
          700: "#44403C",
          600: "#57534E",
          500: "#78716C",
          400: "#A8A29E",
          300: "#D6D3D1",
        },
        accent: {
          DEFAULT: "#854D0E",
          subtle: "#FEF9C3",
          light: "#FEFCE8",
          dark: "#713F12",
        }
      },
      fontFamily: {
        serif: ["Newsreader", "Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        card: "0 2px 8px -2px rgba(28, 25, 23, 0.05), 0 0 0 1px rgba(231, 229, 224, 0.8)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};


