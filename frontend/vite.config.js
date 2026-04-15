import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DOCKER_ENV === 'true' ? 'http://backend:5001' : 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});