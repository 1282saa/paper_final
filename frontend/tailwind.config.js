/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        basewhite: "var(--basewhite)",
        main: "var(--main)",
        second: "var(--second)",
        "sub-1": "var(--sub-1)",
        "sub-2": "var(--sub-2)",
      },
    },
  },
  plugins: [],
};
