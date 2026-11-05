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
  build: {
    // Disable eval for CSP compliance on GitHub Pages
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Avoid eval in production chunks
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Disable source maps in production for CSP
    sourcemap: false,
  },
})