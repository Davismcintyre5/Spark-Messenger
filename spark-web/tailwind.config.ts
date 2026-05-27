import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spark: {
          50: '#EBF3FE',
          100: '#D6E7FD',
          200: '#ADCFFB',
          300: '#85B7F9',
          400: '#5C9FF7',
          500: '#1A73E8',
          600: '#155FBE',
          700: '#104B94',
          800: '#0B376A',
          900: '#062340',
          950: '#03152E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'mobile': { max: '639px' },
        'tablet': { min: '640px', max: '1023px' },
        'desktop': { min: '1024px' },
      },
    },
  },
  plugins: [],
} satisfies Config;