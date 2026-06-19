/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f8fafc',
        ink: '#0f172a',
        brand: '#4f46e5',
        'brand-dark': '#4338ca',
        highlight: '#f97316',
      },
    },
  },
  plugins: [],
}

