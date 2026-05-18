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
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          dark: '#6366F1', // Indigo 500 for brighter interaction
        },
        secondary: {
          DEFAULT: '#22C55E', // Green 500
          dark: '#16A34A', // Green 600 for contrast
        },
        accent: {
          DEFAULT: '#EF4444', // Red 500
          dark: '#DC2626', // Red 600
        },
        background: {
          DEFAULT: '#F1F5F9', // Slate 100 (light mode)
          dark: '#0F172A', // Slate 900 (dark mode)
        },
        surface: {
          DEFAULT: '#FFFFFF', // White (light mode)
          dark: '#1E293B', // Slate 800 (dark mode)
        },
        text: {
          DEFAULT: '#1E293B', // Slate 800 (light mode)
          dark: '#E2E8F0', // Slate 200 (dark mode)
        },
        'text-muted': {
          DEFAULT: '#64748B', // Slate 500 (light mode)
          dark: '#94A3B8', // Slate 400 (dark mode)
        },
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
