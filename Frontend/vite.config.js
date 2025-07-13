import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env variables based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_SOCKET_URL: JSON.stringify(env.VITE_SOCKET_URL),
        // Add other variables you need to expose to frontend
      }
    },
    server: {
      proxy: {
        // Proxy API requests to avoid CORS issues
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5000',
          ws: true,
          changeOrigin: true,
        }
      }
    }
  };
});