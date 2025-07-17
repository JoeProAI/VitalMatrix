/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#00D4FF',
        'neon-purple': '#B537F7',
        'hot-pink': '#FF3D8A',
        'dark-bg': '#0A0A0F',
        'dark-bg-secondary': '#1A1A2E',
        'dark-surface': '#151525',
        'neon-glow': '#00FFFF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.8s ease-out',
        'barcode-scan': 'barcode-scan 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'circuit-flow': 'circuit-flow 8s ease-in-out infinite',
        'circuit-flow-vertical': 'circuit-flow-vertical 12s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)'
          },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(181, 55, 247, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(181, 55, 247, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'barcode-scan': {
          '0%': { transform: 'translateY(-125000%)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(200%)', opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(125000%)', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.3' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'circuit-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'circuit-flow-vertical': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};