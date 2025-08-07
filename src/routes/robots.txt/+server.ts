import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/config/site';

export const GET: RequestHandler = async () => {
	const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteConfig.url}/sitemap.xml

# Crawl-delay (optional, in seconds)
Crawl-delay: 1

# Disallow certain paths (if any)
# Disallow: /admin
# Disallow: /private

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /
`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=86400' // Cache for 24 hours
		}
	});
};
