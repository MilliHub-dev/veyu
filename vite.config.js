import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'https://dev.veyu.cc',
				changeOrigin: true,
				secure: true,
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
				manualChunks(id) {
					// Split vendor chunks for better caching
					if (id.includes('node_modules')) {
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
							return 'vendor-react';
						}
						if (id.includes('@chakra-ui') || id.includes('@emotion') || id.includes('framer-motion')) {
							return 'vendor-chakra';
						}
						if (id.includes('firebase')) {
							return 'vendor-firebase';
						}
					}
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
		include: ['react', 'react-dom', 'react-router-dom', '@chakra-ui/react'],
	},
});
