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
        // Brand Colors
        rust: {
          DEFAULT: '#D2691E',
          light: '#E07B3A',
          dark: '#B8551A',
        },
        brown: {
          DEFAULT: '#5C4033',
          light: '#6E4F40',
          dark: '#4A3329',
        },
        brass: {
          DEFAULT: '#B8860B',
          light: '#D4A829',
          dark: '#9A7109',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        cream: '#FFF8E7',
        charcoal: '#2C2416',
        'warm-gray': '#8B7E74',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-work-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-colony': 'linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%)',
        'gradient-brass': 'linear-gradient(135deg, #D2691E, #B8860B)',
      },
    },
  },
  plugins: [],
};

export default config;