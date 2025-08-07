import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	extensions: ['.svelte', '.md', '.mdx'],
	
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md', '.mdx'],
			remarkPlugins: [remarkGfm, remarkMath],
			rehypePlugins: [
				rehypeKatex,
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'wrap',
						properties: {
							className: ['heading-link']
						}
					}
				]
			],
			highlight: {
				alias: { js: 'javascript', ts: 'typescript' }
			}
		})
	],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			// Static adapter for Cloudflare Pages
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		
		// Path configuration
		paths: {
			base: process.env.NODE_ENV === 'production' ? '' : ''
		},
		
		// Prerender configuration for static generation
		prerender: {
			handleMissingId: 'warn',
			handleHttpError: ({ path, referrer, message }) => {
				// ignore deliberate link to shiny 404 page
				if (path === '/not-found' && referrer === '/blog/how-we-built-our-docs-platform') {
					return;
				}

				// otherwise fail the build
				throw new Error(message);
			}
		},
		
		// Service worker
		serviceWorker: {
			register: false
		},
		
		// CSP configuration
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': ['self', 'https://api.github.com']
			}
		}
	}
};

export default config;
