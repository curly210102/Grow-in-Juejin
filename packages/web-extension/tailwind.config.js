/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "gij-",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
      boxShadow: {
        card: "rgb(0 0 0 / 0.05) var(--gij-color-card-shadow)",
        inner: "inset 0 2px 4px 0 var(--gij-color-inner-shadow)",
      },
      colors: {
        "layer-bg": "rgb(var(--gij-color-layer-bg) / <alpha-value>)",
        "main-bg": "rgb(var(--gij-color-main-bg) / <alpha-value>)",
        primary: "rgb(var(--gij-color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--gij-color-primary-hover) / <alpha-value>)",
        "primary-active":
          "rgb(var(--gij-color-primary-active) / <alpha-value>)",
        "primary-disable": "rgb(var(--gij-color-primary-disable))",
        "main-text": "rgb(var(--gij-color-font) / <alpha-value>)",
        "gray-1-1": "var(--gij-gray-1-1)",
        "gray-1-2": "var(--gij-gray-1-2)",
      },
      opacity: {
        mask: "var(--gij-opacity-mask)",
        "layer-hover": "var(--gij-opacity-layer-hover)",
        widget: "var(--gij-opacity-widget)",
      },
    },
  },
  plugins: [],
};
