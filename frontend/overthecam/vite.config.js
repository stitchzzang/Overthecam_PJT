import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', 
  },
  define: {
    global: 'globalThis', // 🔥 글로벌 객체를 globalThis로 대체
  },
})
