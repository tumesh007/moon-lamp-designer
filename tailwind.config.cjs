/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#07080a',
          900: '#0d0f14',
          850: '#12161f',
          800: '#181d28',
          700: '#232a3a',
          600: '#333e54',
        },
        lunar: {
          gold: '#f5c065',
          warm: '#ffd79a',
          silver: '#e2e8f0',
          crater: '#64748b',
          glow: 'rgba(255, 215, 154, 0.45)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
