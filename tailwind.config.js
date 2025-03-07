/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "false",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-ornament": "rgb(var(--color-primary-ornament) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
