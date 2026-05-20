import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ?? '';
          if (url.startsWith('/find/') && !url.match(/\.\w+$/) && !url.startsWith('/find/data/')) {
            req.url = '/find/index.html';
          }
          next();
        });
      },
    },
  ],
  base: '/find/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
