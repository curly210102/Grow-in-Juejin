/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "gij-",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
      boxShadow: {
        card: "0 0 20px rgb(95 132 255 / 15%)",
      },
    },
  },
  plugins: [],
};
