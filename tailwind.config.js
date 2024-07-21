/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'turquoise': {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
          950: '#004D40'
        },
      },
    },
  },
  plugins: [],
}

