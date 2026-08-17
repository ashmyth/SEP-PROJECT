/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FAF6EE",
          200: "#F4EDE0",
          300: "#EAE0CE",
          400: "#DCBFA4",
          500: "#C89F7D",
          600: "#A97956",
          700: "#81563B",
          800: "#543725",
          900: "#2E1E14",
        },
        espresso: {
          950: "#1A130E",
          900: "#291E16",
          800: "#3D2E23",
          700: "#574334",
          600: "#745C4B",
          500: "#937865",
          400: "#B59C8A",
          300: "#D6C4B6",
          200: "#EADFD6",
          100: "#F5EFEA",
          50: "#FAF7F5",
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
        },
        dreamy: {
          peach: "#FFF1E6",
          rose: "#FDE2E4",
          sun: "#FFF8DC",
          sky: "#E8F0FE",
          sage: "#EAF4EC",
          amber: "#FEF3C7",
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        display: ["Cinzel", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(245, 158, 11, 0.3)",
        "glow-dream": "0 15px 35px -10px rgba(217, 119, 6, 0.25)",
        dreamy: "0 20px 45px -15px rgba(180, 140, 100, 0.15), 0 0 1px 1px rgba(255, 255, 255, 0.9)",
      },
    },
  },
  plugins: [],
};

