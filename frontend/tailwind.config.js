/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        foreground: '#F3F4F6',
        surface: {
          50: '#1F293D',
          100: '#182232',
          200: '#111827',
          300: '#0F172A',
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          dark: '#1D4ED8',
        },
        accent: '#8B5CF6',
      },
    },
  },
  plugins: [],
};
