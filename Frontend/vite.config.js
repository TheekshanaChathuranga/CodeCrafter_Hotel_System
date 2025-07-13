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
    // Ensure that only a single copy of Emotion is bundled. This prevents the
    // "You are loading @emotion/react when it is already loaded" warning that
    // appears when multiple builds/versions end up in the final bundle.
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Dedupe guarantees that Vite (via Rollup) treats these packages as
      // externals and never bundles a second copy if a dependency brings in a
      // nested version.
      dedupe: ["@emotion/react", "@emotion/styled"],
    },
    optimizeDeps: {
      // Also make the dependency optimizer aware that these two should be
      // treated as pre-bundled singletons.
      include: ["@emotion/react", "@emotion/styled"],
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
        '/api': 'http://localhost:5000',
      },
    },
  };
});