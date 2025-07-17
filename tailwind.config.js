/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#00D4FF',
        'neon-purple': '#B537F7',
        'hot-pink': '#FF3D8A',
        'neon-green': '#39FF14',
        'dark-bg': '#0A0A0F',
        'dark-bg-secondary': '#1A1A2E',
        'dark-surface': '#141428',
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'fade-in': 'fade-in 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(circle at center, transparent 0%, #0A0A0F 70%)',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [],
};
