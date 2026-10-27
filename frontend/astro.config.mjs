// @ts-check
// ──────────────────────────────────────────────────────────
// frontend/astro.config.mjs  — Astro framework configuration
//
// LEARNING NOTE:
//   This file lives inside frontend/ because it belongs to
//   the Astro project, not the whole monorepo. The backend
//   package has no knowledge of Astro.
//
//   All paths here are relative to the frontend/ directory.
// ──────────────────────────────────────────────────────────
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://visit-injibara.vercel.app',
  output: 'static',

  build: {
    // Output goes to frontend/dist/ — deploy THIS folder to Vercel/Cloudflare
    outDir: './dist',
  },

  vite: {
    // Path aliases — match the ones in tsconfig.json
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts':    '/src/layouts',
        '@utils':      '/src/utils',
        '@data':       '/src/data',
        '@types':      '/src/types',
      },
    },
    css: {
      devSourcemap: true,
    },
  },

  integrations: [tailwind()],
});