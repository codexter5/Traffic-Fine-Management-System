/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dce9ff',
          200: '#bdd4ff',
          300: '#91b6ff',
          400: '#5f90ff',
          500: '#3f6ef5',
          600: '#2e56db',
          700: '#2344b8',
          800: '#213a96',
          900: '#20357a',
        },
      },
      boxShadow: {
        soft: '0 14px 32px -24px rgba(15, 23, 42, 0.45), 0 8px 16px -14px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
