/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--bg) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--ink-secondary) / <alpha-value>)',
        brand: 'rgb(var(--accent) / <alpha-value>)',
        'brand-dark': 'rgb(var(--accent-dark) / <alpha-value>)',
        highlight: 'rgb(var(--accent) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        glass: 'rgb(var(--glass) / <alpha-value>)',
        'glass-border': 'rgb(var(--glass-border) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Cormorant', 'serif'],
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}

