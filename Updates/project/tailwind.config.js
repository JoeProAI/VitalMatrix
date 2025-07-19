/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'midnight': '#1a1b23',
        'slate-blue': '#2d3748',
        'steel': '#4a5568',
        'mist': '#e2e8f0',
        'pearl': '#f7fafc',
        'ocean': '#2b6cb0',
        'ocean-light': '#3182ce',
        'ocean-dark': '#2c5282',
        'coral': '#ed8936',
        'coral-light': '#f6ad55',
        'coral-dark': '#dd6b20',
        'forest': '#38a169',
        'forest-light': '#48bb78',
        'forest-dark': '#2f855a',
        'amber': '#d69e2e',
        'amber-light': '#ecc94b',
        'ruby': '#e53e3e',
        'lavender': '#805ad5',
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Sans Pro', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      clipPath: {
        'polygon-1': 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        'polygon-2': 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)',
        'hexagon': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d3748' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};