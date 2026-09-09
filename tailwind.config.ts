import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F4FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#8098F9',
          500: '#4F6BF5',
          600: '#2E49E6',
          700: '#1D34BA',
          800: '#0F2792',
          900: '#0A2570',
          950: '#06164A',
          DEFAULT: '#0A2E8A',
        },
        navy: {
          900: '#0A1A3A',
          800: '#0E2452',
          700: '#163673',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        secondary: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
