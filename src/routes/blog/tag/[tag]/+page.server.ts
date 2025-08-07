import { ContentProcessor } from '$lib/utils/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tag = decodeURIComponent(params.tag);
	
	const contentProcessor = new ContentProcessor();
	const allPosts = await contentProcessor.getAllPosts();
	
	// Filter posts by tag
	const posts = allPosts
		.filter(post => post.tags && post.tags.includes(tag))
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	
	// Get related tags (tags that appear in posts with this tag)
	const relatedTagCounts: Record<string, number> = {};
	posts.forEach(post => {
		if (post.tags) {
			post.tags.forEach(postTag => {
				if (postTag !== tag) {
					relatedTagCounts[postTag] = (relatedTagCounts[postTag] || 0) + 1;
				}
			});
		}
	});
	
	const relatedTags = Object.entries(relatedTagCounts)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10); // Show top 10 related tags
	
	return {
		posts,
		tag,
		relatedTags
	};
};