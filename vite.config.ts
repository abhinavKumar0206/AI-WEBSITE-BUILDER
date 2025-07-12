import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';


// Emulate __dirname for ESM
const __dirname = path.resolve();

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/generate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
