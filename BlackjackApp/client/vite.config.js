import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/start': 'http://localhost:3000',
      '/hit': 'http://localhost:3000',
      '/stand': 'http://localhost:3000',
    },
  },
});
