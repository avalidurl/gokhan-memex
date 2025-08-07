import type { PageServerLoad } from './$types';
import { contentProcessor } from '$lib/utils/content';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	try {
		const post = await contentProcessor.getPostBySlug(slug);
		
		if (!post || post.draft) {
			throw error(404, 'Post not found');
		}

		// Get related posts
		const relatedPosts = await contentProcessor.getRelatedPosts(post, 3);

		// Generate table of contents from content
		const toc = generateTableOfContents(post.content);

		return {
			post,
			relatedPosts,
			toc,
			meta: {
				title: post.seo?.title || post.title,
				description: post.seo?.description || post.description,
				keywords: post.seo?.keywords?.join(', ') || post.tags.join(', '),
				author: post.author,
				image: post.seo?.openGraph?.image || post.image,
				type: 'article' as const,
				publishedTime: post.publishedAt.toISOString(),
				modifiedTime: post.updatedAt?.toISOString(),
				section: post.categories[0],
				tags: post.tags
			},
			breadcrumbs: [
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: post.title, href: `/blog/${post.slug}` }
			]
		};
	} catch (err) {
		console.error(`Error loading post ${slug}:`, err);
		throw error(404, 'Post not found');
	}
};

interface TOCItem {
	id: string;
	text: string;
	level: number;
	children?: TOCItem[];
}

function generateTableOfContents(content: string): TOCItem[] {
	// Extract headings from markdown content
	const headingRegex = /^(#{2,6})\s+(.+)$/gm;
	const headings: TOCItem[] = [];
	let match;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length; // Number of # characters
		const text = match[2].trim();
		const id = text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-') // Replace multiple hyphens with single
			.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

		headings.push({
			id,
			text,
			level
		});
	}

	return headings;
}
