import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0f',
          surface: '#141419',
          elevated: '#1c1c24',
        },
        border: {
          DEFAULT: '#27272a',
          subtle: '#3f3f46',
        },
        foreground: {
          DEFAULT: '#e5e5e5',
          secondary: '#737373',
          muted: '#525252',
        },
        accent: {
          bitcoin: '#f7931a',
          green: '#22c55e',
          red: '#ef4444',
          blue: '#3b82f6',
        },
        primary: {
          DEFAULT: '#f7931a',
          foreground: '#0a0a0f',
        },
        card: {
          DEFAULT: '#141419',
          foreground: '#e5e5e5',
        },
        muted: {
          DEFAULT: '#1c1c24',
          foreground: '#737373',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#e5e5e5',
        },
        success: {
          DEFAULT: '#22c55e',
          foreground: '#0a0a0f',
        },
        warning: {
          DEFAULT: '#f7931a',
          foreground: '#0a0a0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(247, 147, 26, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(247, 147, 26, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
