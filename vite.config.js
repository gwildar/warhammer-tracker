import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/old-world-tracker/',
  plugins: [tailwindcss()],
})
