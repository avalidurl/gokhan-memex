import { ContentProcessor } from '$lib/utils/content';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

export const load: PageServerLoad = async ({ params }) => {
	const year = parseInt(params.year);
	
	if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
		throw error(404, 'Year not found');
	}
	
	const contentProcessor = new ContentProcessor();
	const allPosts = await contentProcessor.getAllPosts();
	
	// Filter posts by year
	const posts = allPosts
		.filter(post => new Date(post.publishedAt).getFullYear() === year)
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	
	if (posts.length === 0) {
		throw error(404, 'No posts found for this year');
	}
	
	// Group posts by month
	const monthGroups: Record<string, number> = {};
	
	posts.forEach(post => {
		const month = (new Date(post.publishedAt).getMonth() + 1).toString().padStart(2, '0');
		monthGroups[month] = (monthGroups[month] || 0) + 1;
	});
	
	// Convert to array and sort by month (descending)
	const months = Object.entries(monthGroups)
		.map(([month, count]) => ({
			month,
			monthName: monthNames[parseInt(month) - 1],
			count
		}))
		.sort((a, b) => parseInt(b.month) - parseInt(a.month));
	
	return {
		posts,
		year: year.toString(),
		months
	};
};