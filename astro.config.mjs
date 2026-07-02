import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';

/**
 * Rewrite local content images to Cloudflare Images at build time.
 * Image ids on the CDN mirror site paths (uploaded as e.g. `blog/images/foo.webp`),
 * and flexible variants are enabled — so every markdown image gets a responsive
 * srcset with on-the-fly resizing and format negotiation. SVGs and external
 * URLs pass through untouched; repo files remain the source of truth.
 */
const CDN_HASH = '6y1i3FNnwnl61Xv3wGE82g';
function rehypeCdnImages() {
  const CDN = `https://imagedelivery.net/${CDN_HASH}`;
  return (tree) => {
    visit(tree, 'element', (node) => {
      const src = node.properties?.src;
      if (
        node.tagName === 'img' &&
        typeof src === 'string' &&
        /^\/(images|blog\/images)\//.test(src) &&
        !/\.svg$/i.test(src)
      ) {
        const id = src.slice(1);
        node.properties.src = `${CDN}/${id}/w=1200,format=auto`;
        node.properties.srcset = [400, 800, 1200]
          .map((w) => `${CDN}/${id}/w=${w},format=auto ${w}w`)
          .join(', ');
        node.properties.sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px';
        node.properties.loading ??= 'lazy';
        node.properties.decoding ??= 'async';
      }
    });
  };
}

export default defineConfig({
  site: 'https://gokhanturhan.com',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Update lastmod to current time for better indexing
        item.lastmod = new Date();
        // Set higher priority for important pages
        if (item.url === '' || item.url === '/' || item.url.includes('/journal/')) {
          item.priority = 1.0;
        }
        // Ensure canonical trailing slash format
        if (item.url && !item.url.endsWith('/')) {
          item.url = item.url + '/';
        }
        return item;
      }
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    },
    rehypePlugins: [
      rehypeCdnImages,
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to section'
        }
      }]
    ]
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});