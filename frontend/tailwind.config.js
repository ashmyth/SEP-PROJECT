/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          950: "#07090E",
          900: "#0B0E15",
          850: "#0E1118",
          800: "#141824",
          700: "#1B2130",
          600: "#283147",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        display: ["Cinzel", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(245, 158, 11, 0.3)",
        "glow-subtle": "0 0 20px 0 rgba(245, 158, 11, 0.15)",
        glass: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "subtle-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
