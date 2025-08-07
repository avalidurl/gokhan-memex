import type { RequestHandler } from './$types';
import { contentProcessor } from '$lib/utils/content';
import { siteConfig } from '$lib/config/site';

export const GET: RequestHandler = async () => {
	try {
		const posts = await contentProcessor.getAllPosts({
			includeDrafts: false
		});

		const [tags, categories] = await Promise.all([
			contentProcessor.getAllTags(),
			contentProcessor.getAllCategories()
		]);

		// Static pages
		const staticPages = [
			{ url: '', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
			{ url: '/blog', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.9' },
			{ url: '/archive', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' },
			{ url: '/links', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.6' },
			{ url: '/lists', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.6' },
		];

		// Blog posts
		const postPages = posts.map(post => ({
			url: `/blog/${post.slug}`,
			lastmod: (post.updatedAt || post.publishedAt).toISOString(),
			changefreq: 'monthly',
			priority: post.featured ? '0.8' : '0.7'
		}));

		// Tag pages
		const tagPages = tags.map(tag => ({
			url: `/blog/tag/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, '-'))}`,
			lastmod: new Date().toISOString(),
			changefreq: 'weekly',
			priority: '0.5'
		}));

		// Category pages  
		const categoryPages = categories.map(category => ({
			url: `/blog/category/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`,
			lastmod: new Date().toISOString(),
			changefreq: 'weekly',
			priority: '0.6'
		}));

		const allPages = [...staticPages, ...postPages, ...tagPages, ...categoryPages];

		const sitemapEntries = allPages.map(page => `
			<url>
				<loc>${siteConfig.url}${page.url}</loc>
				<lastmod>${page.lastmod}</lastmod>
				<changefreq>${page.changefreq}</changefreq>
				<priority>${page.priority}</priority>
			</url>
		`).join('');

		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${sitemapEntries}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};
