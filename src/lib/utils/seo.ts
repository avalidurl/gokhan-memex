import type { ContentMeta } from '$lib/types/content';
import { siteConfig } from '$lib/config/site';

/**
 * SEO utilities for generating meta tags and structured data
 */

export function generateMetaTags(meta: ContentMeta): Record<string, string> {
	const tags: Record<string, string> = {};

	// Basic meta tags
	if (meta.title) {
		tags['title'] = meta.title;
		tags['og:title'] = meta.title;
		tags['twitter:title'] = meta.title;
	}

	if (meta.description) {
		tags['description'] = meta.description;
		tags['og:description'] = meta.description;
		tags['twitter:description'] = meta.description;
	}

	if (meta.keywords) {
		tags['keywords'] = meta.keywords;
	}

	if (meta.author) {
		tags['author'] = meta.author;
	}

	// Open Graph tags
	tags['og:site_name'] = siteConfig.name;
	tags['og:type'] = meta.type || 'website';
	
	if (meta.image) {
		const imageUrl = meta.image.startsWith('http') 
			? meta.image 
			: `${siteConfig.url}${meta.image}`;
		tags['og:image'] = imageUrl;
		tags['twitter:image'] = imageUrl;
	}

	// Twitter Card
	tags['twitter:card'] = siteConfig.seo.twitterCard;
	tags['twitter:site'] = siteConfig.author.twitter;
	tags['twitter:creator'] = siteConfig.author.twitter;

	// Article specific
	if (meta.type === 'article') {
		if (meta.publishedTime) {
			tags['article:published_time'] = meta.publishedTime;
		}
		if (meta.modifiedTime) {
			tags['article:modified_time'] = meta.modifiedTime;
		}
		if (meta.section) {
			tags['article:section'] = meta.section;
		}
		if (meta.tags) {
			meta.tags.forEach((tag, index) => {
				tags[`article:tag:${index}`] = tag;
			});
		}
		if (meta.author) {
			tags['article:author'] = meta.author;
		}
	}

	return tags;
}

export function generateStructuredData(meta: ContentMeta & {
	url?: string;
	wordCount?: number;
	readingTime?: number;
}): object {
	const baseStructuredData: any = {
		'@context': 'https://schema.org',
		'@type': meta.type === 'article' ? 'BlogPosting' : 'WebPage',
		headline: meta.title,
		description: meta.description,
		url: meta.url || siteConfig.url,
		author: {
			'@type': 'Person',
			name: meta.author || siteConfig.author.name,
			url: siteConfig.url
		},
		publisher: {
			'@type': 'Organization',
			name: siteConfig.name,
			url: siteConfig.url,
			logo: {
				'@type': 'ImageObject',
				url: `${siteConfig.url}/favicon.svg`
			}
		}
	};

	if (meta.image) {
		const imageUrl = meta.image.startsWith('http') 
			? meta.image 
			: `${siteConfig.url}${meta.image}`;
		
		baseStructuredData.image = {
			'@type': 'ImageObject',
			url: imageUrl
		};
	}

	if (meta.type === 'article') {
		if (meta.publishedTime) {
			baseStructuredData.datePublished = meta.publishedTime;
		}
		if (meta.modifiedTime) {
			baseStructuredData.dateModified = meta.modifiedTime;
		}
		if (meta.wordCount) {
			baseStructuredData.wordCount = meta.wordCount;
		}
		if (meta.readingTime) {
			baseStructuredData.timeRequired = `PT${meta.readingTime}M`;
		}
		if (meta.tags) {
			baseStructuredData.keywords = meta.tags;
		}

		// Add breadcrumb
		baseStructuredData.breadcrumb = {
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Home',
					item: siteConfig.url
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Blog',
					item: `${siteConfig.url}/blog`
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: meta.title,
					item: meta.url
				}
			]
		};
	}

	return baseStructuredData;
}

export function generateCanonicalUrl(path: string): string {
	return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function generateOGImageUrl(title: string, description?: string): string {
	const params = new URLSearchParams();
	params.set('title', title);
	if (description) {
		params.set('description', description);
	}
	
	return `${siteConfig.url}/api/og?${params.toString()}`;
}

export function sanitizeTitle(title: string, maxLength: number = 60): string {
	if (title.length <= maxLength) return title;
	
	// Try to cut at word boundary
	const truncated = title.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	
	if (lastSpace > maxLength * 0.75) {
		return truncated.substring(0, lastSpace) + '...';
	}
	
	return truncated + '...';
}

export function sanitizeDescription(description: string, maxLength: number = 160): string {
	if (description.length <= maxLength) return description;
	
	// Try to cut at word boundary
	const truncated = description.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	
	if (lastSpace > maxLength * 0.75) {
		return truncated.substring(0, lastSpace) + '...';
	}
	
	return truncated + '...';
}

export function generateSiteMapUrl(path: string, lastMod?: Date, changeFreq?: 'daily' | 'weekly' | 'monthly' | 'yearly', priority?: number) {
	return {
		url: generateCanonicalUrl(path),
		lastmod: lastMod?.toISOString() || new Date().toISOString(),
		changefreq: changeFreq || 'weekly',
		priority: priority || 0.5
	};
}

export function generateRSSItem(meta: ContentMeta & {
	url?: string;
	content?: string;
}) {
	return {
		title: meta.title,
		description: meta.description,
		link: meta.url || generateCanonicalUrl(''),
		guid: meta.url || generateCanonicalUrl(''),
		pubDate: meta.publishedTime ? new Date(meta.publishedTime).toUTCString() : new Date().toUTCString(),
		author: meta.author || siteConfig.author.email,
		category: meta.tags ? meta.tags.join(', ') : '',
		content: meta.content || meta.description
	};
}
