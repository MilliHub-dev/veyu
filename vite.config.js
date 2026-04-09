import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
    proxy: {
      '/api': {
        target: 'https://dev.veyu.cc',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },

  // Force a single instance of every package that uses React internals or
  // registers a global singleton (emotion cache, React dispatcher, etc.)
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-router',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@emotion/utils',
      '@emotion/serialize',
      '@chakra-ui/react',
      'framer-motion',
    ],
  },

  // Pre-bundle ALL singleton packages together so Vite never creates two
  // separate pre-bundle entries that each contain their own React copy.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-router',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@chakra-ui/react',
      'framer-motion',
    ],
    // Exclude nothing — let Vite pre-bundle everything together
    exclude: [],
  },

  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Keep React + ecosystem in ONE shared chunk so no page chunk ever
        // gets its own copy of React.
        manualChunks(id) {
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          if (
            id.includes('/node_modules/@emotion/') ||
            id.includes('/node_modules/@chakra-ui/') ||
            id.includes('/node_modules/framer-motion/')
          ) {
            return 'ui-vendor';
          }
        },
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },

  esbuild: {
    // Only drop console/debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
