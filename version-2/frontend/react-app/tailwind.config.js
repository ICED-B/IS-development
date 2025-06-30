/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#1e40af', // blue-800
        background: '#f9fafb', // gray-50
      },
    },
  },
  plugins: [],    //nastavuje dostupné barvy
}
