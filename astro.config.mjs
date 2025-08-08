import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gokhanturhan.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});