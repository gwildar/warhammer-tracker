import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/old-world-tracker/',
  plugins: [tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
