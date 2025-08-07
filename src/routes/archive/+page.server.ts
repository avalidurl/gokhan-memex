import { ContentProcessor } from '$lib/utils/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const contentProcessor = new ContentProcessor();
	const posts = await contentProcessor.getAllPosts();
	
	// Group posts by year
	const yearGroups: Record<string, number> = {};
	
	posts.forEach(post => {
		const year = new Date(post.publishedAt).getFullYear().toString();
		yearGroups[year] = (yearGroups[year] || 0) + 1;
	});
	
	// Convert to array and sort by year (descending)
	const years = Object.entries(yearGroups)
		.map(([year, count]) => ({ year, count }))
		.sort((a, b) => parseInt(b.year) - parseInt(a.year));
	
	return {
		posts: posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
		years
	};
};