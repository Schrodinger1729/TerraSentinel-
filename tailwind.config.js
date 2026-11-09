/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111d",
        panel: "#0d1b2a",
        cyan: "#32d6e5",
        orange: "#ff9d58",
      },
    },
  },
  plugins: [],
};
