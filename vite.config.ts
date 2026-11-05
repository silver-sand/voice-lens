import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // GitHub Pages deployment: set base to repo name
  // For local dev, base is '/'. For GitHub Pages, use '/<repo-name>/'
  base: process.env.GITHUB_PAGES ? `/${process.env.GITHUB_REPO_NAME || 'voice-lens'}/` : '/',
})