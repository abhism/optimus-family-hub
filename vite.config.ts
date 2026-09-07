import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `base` is only applied to builds. GitHub Pages serves a project site from
 * /<repo>/, so the built asset URLs need that prefix — but applying it in dev
 * would move the dev server to localhost:5173/optimus-family-hub/ for no
 * reason, so `npm run dev` stays at the root.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/optimus-family-hub/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
}))
