/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        paper: '#FAFAF9',
        line: '#E9E7E4',
        ink: {
          DEFAULT: '#17171A',
          soft: '#3F3F46',
          muted: '#71717A',
          faint: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#3730A3',
          hover: '#312E81',
          deep: '#241F73',
          soft: '#EEF2FF',
          line: '#C7D2FE',
          ring: '#6366F1',
        },
        positive: '#0F766E',
        warn: '#B45309',
        warnsoft: '#FFFBEB',
        danger: '#B91C1C',
        dangersoft: '#FEF2F2',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        phone: '2.75rem',
        screen: '2.25rem',
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,23,26,0.04), 0 1px 3px rgba(23,23,26,0.03)',
        lift: '0 4px 16px -4px rgba(23,23,26,0.10), 0 2px 6px -2px rgba(23,23,26,0.06)',
        device: '0 40px 80px -24px rgba(23,23,26,0.32), 0 0 0 1px rgba(23,23,26,0.06)',
        plastic: '0 12px 28px -10px rgba(23,23,26,0.42)',
        dock: '0 12px 32px -8px rgba(23,23,26,0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'card-reveal': {
          '0%': { opacity: '0', transform: 'rotateY(90deg) scale(0.88)' },
          '55%': { opacity: '1', transform: 'rotateY(-8deg) scale(1.02)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg) scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'scan-face': {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 260ms cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-left': 'slide-in-left 280ms cubic-bezier(0.22,1,0.36,1) both',
        'sheet-up': 'sheet-up 320ms cubic-bezier(0.22,1,0.36,1) both',
        'card-reveal': 'card-reveal 900ms cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        'scan-face': 'scan-face 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
