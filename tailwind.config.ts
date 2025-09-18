import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        school: {
          50: '#f3f8ff',
          100: '#e7f0fe',
          200: '#cfe0fd',
          300: '#a8c6fb',
          400: '#79a4f7',
          500: '#4f82ef',
          600: '#3865dd',
          700: '#2c4fb9',
          800: '#274395',
          900: '#243a7a',
        },
        chalk: '#f9f7f1',
        board: '#1f2937',
        accent: '#f59e0b',
        pastel: {
          pink: '#FDE2E4',
          peach: '#FAD2E1',
          mint: '#D0F4DE',
          sky: '#CDE7F0',
          lilac: '#E2D5F8',
        },
      },
      fontFamily: {
        display: ['\"Comic Neue\"', 'ui-sans-serif', 'system-ui'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

export default config;
