/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          blue: '#00d4ff',
          'blue-dark': '#0066ff',
          'blue-light': '#4df0ff',
          cyan: '#00ffff',
          dark: '#0a0e1a',
          'dark-light': '#0f1419',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 212, 255, 0.5)',
        'glow': '0 0 20px rgba(0, 212, 255, 0.6)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.8)',
      },
    },
  },
  plugins: [],
}
