/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        pitch: {
          950: '#04150A',
          900: '#06200F',
          800: '#092D17',
          700: '#0D3D20',
          600: '#125229',
          500: '#166534',
          400: '#16A34A',
          300: '#22C55E',
          200: '#4ADE80',
          100: '#BBF7D0',
        },
      },
      animation: {
        'live-pulse': 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'score-in': 'scoreIn 0.4s ease-out',
      },
      keyframes: {
        scoreIn: {
          '0%':   { transform: 'scale(1.08)', opacity: '0.7' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
