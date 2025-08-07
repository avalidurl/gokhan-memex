import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';

const config: UserConfig = defineConfig({
	plugins: [sveltekit()],
	
	// Development server configuration
	server: {
		port: 3000,
		host: true,
		fs: {
			allow: ['..']
		}
	},
	
	// Preview server configuration
	preview: {
		port: 4173,
		host: true
	},
	
	// Build optimizations
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			// Let SvelteKit handle chunking automatically
		}
	},
	
	// Optimization configuration
	optimizeDeps: {
		include: [
			'fuse.js',
			'gray-matter',
			'js-yaml',
			'lucide-svelte',
			'web-vitals'
		]
	},
	
	// CSS configuration
	css: {
		postcss: {
			plugins: []
		}
	},
	
	// Define global constants
	define: {
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
	},
	
	// Worker configuration for service worker
	worker: {
		format: 'es'
	},
	
	// Test configuration
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/lib/test/setup.ts']
	}
});

export default config;
