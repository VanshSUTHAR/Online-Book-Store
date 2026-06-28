/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        paper: "#FAF9F6",
        slate: {
          rich: "#1E293B",
          dark: "#0F172A",
          muted: "#64748B",
        },
        terracotta: {
          DEFAULT: "#991B1B",
          hover: "#7F1D1D",
          light: "#FEF2F2",
        },
        teal: {
          deep: "#0F766E",
          hover: "#115E59",
        },
        primary: "#991B1B",
        secondary: "#0F766E",
        accent: "#991B1B",
        background: "#FAF9F6",
        text: "#1E293B",
      },
      boxShadow: {
        editorial: "0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        'editorial-hover': "0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 8px 20px -4px rgba(15, 23, 42, 0.06)",
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
