import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'https://dev.veyu.cc',
				changeOrigin: true,
				secure: false, // Don't verify SSL certificates
				rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
			},
		},
	},
	build: {
		outDir: 'dist',
		// Use esbuild for minification (built-in, faster than terser)
		minify: 'esbuild',
		// Optimize chunk splitting
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom', 'react-router-dom'],
					ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
				},
			},
		},
		// No source maps in production
		sourcemap: false,
		// Set chunk size warning limit
		chunkSizeWarningLimit: 1000,
	},
	// Remove console logs in production
	esbuild: {
		drop: ['console', 'debugger'],
	},
	// Optimize dependency pre-bundling
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom', '@chakra-ui/react', 'framer-motion'],
	},
});
