/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#2563EB",
        secondary: "#7C3AED",
        accent: "#F59E0B",
        background: "#F8FAFC",
        text: "#0F172A",
      },
    },
  },
  plugins: [],
}
