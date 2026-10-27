/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        injibara: {
          emerald: '#0f5132',
          emeraldLight: '#10b981',
          amber: '#d97706',
          gold: '#f59e0b',
          clay: '#9a3412',
          sand: '#fef3c7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Ethiopic"', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
