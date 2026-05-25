import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 프론트엔드는 포트 3000, /api 요청은 백엔드(5000)로 프록시합니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
