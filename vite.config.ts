import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/personal-nav/',
  publicDir: 'public',
  // Phase A validates an isolated build; the existing Pages artifact stays intact.
  build: { outDir: '.phase-a-build' },
})
