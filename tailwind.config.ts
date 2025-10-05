import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Unchained Brand Colors
        'resistance-red': '#e04545',
        resistance: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#e04545', // Main resistance red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'hack-green': '#a6ff47',
        'neon-green': '#c4ff00',
        ink: {
          900: '#0b0b0c',
          800: '#121316',
          700: '#1a1b1e',
          100: '#f2f0ea',
        },
        bone: {
          100: '#f2f0ea',
        },
        grit: {
          500: '#5e6166',
          400: '#7a7d80',
        },
        signal: {
          500: '#e33b3b',
        },
        acid: {
          400: '#a6ff47',
        },
        cobalt: {
          500: '#3f73ff',
        },
        accent: {
          red: '#e04545',
          teal: '#5ab0a9',
          neon: '#c4ff00',
        },
        bg: {
          0: '#0b0c0e',
          1: '#14161a',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        heading: ['Special Elite', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '3rem',
      },
      boxShadow: {
        ink: '0 8px 24px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'neon-pulse': 'neonPulse 0.9s linear infinite',
        flicker: 'flicker 2s infinite',
      },
      keyframes: {
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(196, 255, 0, 0)' },
          '60%': { boxShadow: '0 0 18px rgba(196, 255, 0, 0.25)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'noise-pattern': "url('/assets/textures/noise.png')",
        'torn-edge': "url('/assets/textures/torn-edge.svg')",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
