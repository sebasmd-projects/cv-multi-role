import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        phosphor: 'var(--phosphor)',
        signal: 'var(--signal)',
        pulse: 'var(--pulse)',
      },
    },
  },
  plugins: [],
} satisfies Config;
