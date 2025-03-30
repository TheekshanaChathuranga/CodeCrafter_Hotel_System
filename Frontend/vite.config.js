import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [
    react(),          // Add React plugin for JSX support
    tailwindcss(),    // Keep Tailwind CSS plugin
  ],
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