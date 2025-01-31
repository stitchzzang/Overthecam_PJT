import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // 🔥 글로벌 객체를 globalThis로 대체
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://i12d204.p.ssafy.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})