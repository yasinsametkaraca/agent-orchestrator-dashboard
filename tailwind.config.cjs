/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pa-bg': '#F6F7FA',
        'pa-blue': '#3476FA'
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.06)'
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
