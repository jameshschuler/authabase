import type { Config } from 'tailwindcss'

// Kept for shadcn tooling compatibility; semantic tokens live in src/styles/globals.css.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
