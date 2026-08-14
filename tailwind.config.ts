import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds — deep forest / espresso black
        bg: {
          base: '#07110D',
          deep: '#0A1510',
          deeper: '#0D1B14',
        },
        surface: {
          DEFAULT: '#102018',
          raised: '#14271E',
          high: '#182C22',
        },
        accent: {
          deep: '#183B2B',
          mid: '#1E4A35',
          bright: '#275D40',
        },
        amber: {
          DEFAULT: '#D6A84F',
          bright: '#E7B85C',
          glow: '#F2C66D',
        },
        cream: '#E8DFC9',
        muted: '#8D9B8F',
        danger: '#7A3B3B',
        dangerBright: '#A34D4D',
        success: '#6FA37B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        ambient: '0 20px 60px -20px rgba(0,0,0,0.8)',
        halo: '0 0 0 1px rgba(230,184,92,0.35), 0 0 24px -4px rgba(230,184,92,0.4)',
        'halo-green': '0 0 0 1px rgba(111,163,123,0.3), 0 0 20px -6px rgba(111,163,123,0.4)',
        glow: '0 0 40px -10px rgba(230,184,92,0.5)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.6' },
          '94%': { opacity: '1' },
          '97%': { opacity: '0.8' },
        },
        'drift': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        flicker: 'flicker 6s linear infinite',
        drift: 'drift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
