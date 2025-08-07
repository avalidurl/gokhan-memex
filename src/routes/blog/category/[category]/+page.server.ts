import { ContentProcessor } from '$lib/utils/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const category = decodeURIComponent(params.category);
	
	const contentProcessor = new ContentProcessor();
	const allPosts = await contentProcessor.getAllPosts();
	
	// Filter posts by category
	const posts = allPosts
		.filter(post => post.category === category)
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	
	// Get all other categories with their counts
	const categoryCounts: Record<string, number> = {};
	allPosts.forEach(post => {
		if (post.category && post.category !== category) {
			categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
		}
	});
	
	const relatedCategories = Object.entries(categoryCounts)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
	
	return {
		posts,
		category,
		relatedCategories
	};
};