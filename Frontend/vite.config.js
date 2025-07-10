import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import commonjs from 'vite-plugin-commonjs';
import path from 'path';


export default defineConfig({
  base: '/',
  plugins: [
    react(),          // Add React plugin for JSX support
    tailwindcss(),
    commonjs(),    // Keep Tailwind CSS plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true,              // Handle CORS by changing origin
        secure: false,                   // For local dev, no HTTPS
      },
    },
  },
});