/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Google Stitch Tactical Design System Tokens
        surface: '#0c0c0e',
        'surface-subtle': '#121216',
        'surface-container': '#17171d',
        'surface-container-low': '#141418',
        'surface-container-high': '#1f1f27',
        'surface-container-highest': '#282833',
        'surface-bright': '#39393b',
        'border-subtle': '#22222a',
        'border-medium': '#2d2d38',
        'border-focus': '#4953bc',
        primary: '#818cf8',
        'primary-soft': 'rgba(129, 140, 248, 0.12)',
        'primary-container': '#6366f1',
        'on-primary-container': '#ffffff',
        secondary: '#7bd0ff',
        'secondary-soft': 'rgba(123, 208, 255, 0.12)',
        'secondary-container': '#00a6e0',
        'on-secondary-container': '#00374d',
        tertiary: '#f7bd3e',
        'tertiary-soft': 'rgba(247, 189, 62, 0.12)',
        'on-tertiary': '#261900',
        danger: '#f87171',
        'danger-soft': 'rgba(248, 113, 113, 0.12)',
        success: '#34d399',
        'success-soft': 'rgba(52, 211, 153, 0.12)',
        'text-primary': '#f3f4f6',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',
        'on-surface': '#e5e1e4',
        'on-surface-variant': '#c6c5d5',

        // Legacy Precision Minimalist Dark Palette (Backward Compatibility)
        background: {
          DEFAULT: '#09090b',
          container: '#121215',
          panel: '#18181c',
          elevated: '#202026',
        },
        border: {
          subtle: '#27272a',
          elevated: '#3f3f46',
          active: '#52525b',
        },
        tactical: {
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
          },
          emerald: {
            DEFAULT: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          amber: {
            DEFAULT: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          rose: {
            DEFAULT: '#f43f5e',
            light: '#fb7185',
            dark: '#e11d48',
          },
        },
      },
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        hud: '0 4px 12px 0 rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
};
