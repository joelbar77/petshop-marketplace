/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50, #fff7ed)",
          100: "var(--brand-100, #ffedd5)",
          500: "var(--brand-500, #ea7c1e)",
          600: "var(--brand-600, #d3670f)",
          700: "var(--brand-700, #b0530c)",
        },
      },
    },
  },
  plugins: [],
};
