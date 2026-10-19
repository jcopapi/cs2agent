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
        // Precision Minimalist Dark Palette (Charcoal / Near-Black)
        background: {
          DEFAULT: '#09090b', // zinc-950 base background
          container: '#121215', // dark charcoal surface
          panel: '#18181c', // elevated card/panel
          elevated: '#202026', // hover/interactive surface
        },
        border: {
          subtle: '#27272a', // zinc-800 1px subtle border
          elevated: '#3f3f46', // zinc-700 active/highlight border
          active: '#52525b', // zinc-600 focus border
        },
        // Tactical Functional Accents (Strictly zero gamer-RGB clutter)
        tactical: {
          cyan: {
            DEFAULT: '#06b6d4', // cyan-500: Lineups, utility paths, inferred observations
            light: '#22d3ee', // cyan-400
            dark: '#0891b2', // cyan-600
          },
          emerald: {
            DEFAULT: '#10b981', // emerald-500: Confirmed observations, success states
            light: '#34d399', // emerald-400
            dark: '#059669', // emerald-600
          },
          amber: {
            DEFAULT: '#f59e0b', // amber-500: Reported observations, caution, simulation
            light: '#fbbf24', // amber-400
            dark: '#d97706', // amber-600
          },
          rose: {
            DEFAULT: '#f43f5e', // rose-500: Bomb timer countdown, critical danger
            light: '#fb7185', // rose-400
            dark: '#e11d48', // rose-600
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Courier New',
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
