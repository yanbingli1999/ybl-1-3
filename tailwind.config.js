/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-space': '#0a0e1a',
        'neon-green': '#00ff88',
        'neon-cyan': '#00d4ff',
        'neon-purple': '#7b61ff',
        'alert-red': '#ff3366',
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pet-idle': 'pet-idle 2s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
