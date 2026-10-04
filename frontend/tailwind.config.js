/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          900: '#0b131e',
          800: '#111c2d',
          700: '#1b2a41',
          600: '#273c5a',
          500: '#38547c',
          accent: '#00d2ff',
          flame: '#ff5722',
          amber: '#ffb300',
          success: '#10b981',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
