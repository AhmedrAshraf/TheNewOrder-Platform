/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#333333',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#333333',
          600: '#292929',
          700: '#1F1F1F',
          800: '#141414',
          900: '#0A0A0A'
        },
        secondary: {
          DEFAULT: '#00D9C0',
          50: '#E6FFF9',
          100: '#CCFFF3',
          200: '#99FFE6',
          300: '#66FFD9',
          400: '#33FFCC',
          500: '#00D9C0',
          600: '#00B09D',
          700: '#00877A',
          800: '#005E57',
          900: '#003534'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#333333',
          900: '#333333'
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif']
      }
    }
  }
};