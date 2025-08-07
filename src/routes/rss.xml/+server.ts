import type { RequestHandler } from './$types';
import { contentProcessor } from '$lib/utils/content';
import { siteConfig } from '$lib/config/site';

export const GET: RequestHandler = async () => {
	try {
		const posts = await contentProcessor.getAllPosts({
			limit: 20,
			includeDrafts: false,
			sortBy: 'date',
			sortOrder: 'desc'
		});

		const rssItems = posts.map(post => {
			const postUrl = `${siteConfig.url}/blog/${post.slug}`;
			const pubDate = post.publishedAt.toUTCString();
			
			return `
				<item>
					<title><![CDATA[${post.title}]]></title>
					<description><![CDATA[${post.description}]]></description>
					<link>${postUrl}</link>
					<guid>${postUrl}</guid>
					<pubDate>${pubDate}</pubDate>
					<author>${siteConfig.author.email} (${post.author})</author>
					${post.categories.map(cat => `<category>${cat}</category>`).join('')}
					${post.image ? `<enclosure url="${siteConfig.url}${post.image}" type="image/jpeg" />` : ''}
				</item>
			`.trim();
		}).join('');

		const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${siteConfig.name}</title>
		<description>${siteConfig.description}</description>
		<link>${siteConfig.url}</link>
		<atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
		<language>en-us</language>
		<managingEditor>${siteConfig.author.email} (${siteConfig.author.name})</managingEditor>
		<webMaster>${siteConfig.author.email} (${siteConfig.author.name})</webMaster>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		<ttl>60</ttl>
		<image>
			<url>${siteConfig.url}/favicon.svg</url>
			<title>${siteConfig.name}</title>
			<link>${siteConfig.url}</link>
		</image>
		${rssItems}
	</channel>
</rss>`;

		return new Response(rss, {
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating RSS feed:', error);
		return new Response('Error generating RSS feed', { status: 500 });
	}
};
