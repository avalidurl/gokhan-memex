import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';
import { journalLastmodByUrl } from './src/lib/post-dates.ts';
import { cdnImage, cdnSrcset, isCdnManaged } from './src/lib/cdn-image.ts';

/**
 * Rewrite local content images to Cloudflare Images at build time.
 * Image ids on the CDN mirror site paths (uploaded as e.g. `blog/images/foo.webp`),
 * and flexible variants are enabled — so every markdown image gets a responsive
 * srcset with on-the-fly resizing and format negotiation. SVGs, favicons and
 * external URLs pass through untouched; repo files remain the source of truth.
 */
function rehypeCdnImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const src = node.properties?.src;
      if (node.tagName === 'img' && typeof src === 'string' && isCdnManaged(src)) {
        node.properties.src = cdnImage(src, 1200);
        node.properties.srcset = cdnSrcset(src);
        node.properties.sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px';
        node.properties.loading ??= 'lazy';
        node.properties.decoding ??= 'async';
      }
    });
  };
}

/**
 * Wrap every markdown/MDX table in a div.table-wrap (overflow-x: auto, styled
 * in critical.css) so wide ledger tables scroll inside their own container and
 * the page body never scrolls horizontally.
 */
function rehypeTableWrap() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'table' &&
        parent &&
        typeof index === 'number' &&
        !(parent.type === 'element' && parent.tagName === 'div' &&
          Array.isArray(parent.properties?.className) &&
          parent.properties.className.includes('table-wrap'))
      ) {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [node],
        };
        return 'skip';
      }
    });
  };
}

const journalLastmod = journalLastmodByUrl();

export default defineConfig({
  site: 'https://gokhanturhan.com',
  output: 'static',
  // Keep the current whitespace. The v7 default drops spaces between inline elements.
  compressHTML: true,
  // Journal routes still read entry.slug and entry.render().
  legacy: {
    collectionsBackwardsCompat: true,
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: ['https://gokhanturhan.com/', 'https://gokhanturhan.com/turkish-art-blob/', 'https://gokhanturhan.com/ethereum-doomsday/', 'https://gokhanturhan.com/turkish-art-blob/tr/'],
      // 404 pages must not be indexed; every other public page is in the sitemap.
      filter: (page) => !/\/404\/?$/.test(page),
      serialize(item) {
        const journalMod = journalLastmod[item.url] || journalLastmod[item.url?.endsWith('/') ? item.url : item.url + '/'];
        item.lastmod = journalMod || new Date();
        // Set higher priority for important pages
        if (item.url === '' || item.url === '/' || item.url === 'https://gokhanturhan.com/' || item.url.includes('/journal/')) {
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
      // House code register — no color literals in the emitted HTML. The
      // css-variables theme makes the highlighter emit var(--astro-code-*)
      // references; those variables are pinned to the four house tokens in
      // critical.css (inlined on every page), so code blocks invert with the
      // sheet in both themes without any post-hoc remapping.
      theme: 'css-variables',
      wrap: true
    },
    processor: unified({
      rehypePlugins: [
        rehypeCdnImages,
        rehypeTableWrap,
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: 'wrap',
          properties: {
            className: ['anchor-link'],
            ariaLabel: 'Link to section'
          }
        }]
      ]
    })
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});