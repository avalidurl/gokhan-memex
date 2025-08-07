import { ContentProcessor } from '$lib/utils/content';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

export const load: PageServerLoad = async ({ params }) => {
	const year = parseInt(params.year);
	const month = parseInt(params.month);
	
	if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
		throw error(404, 'Year not found');
	}
	
	if (isNaN(month) || month < 1 || month > 12) {
		throw error(404, 'Invalid month');
	}
	
	const contentProcessor = new ContentProcessor();
	const allPosts = await contentProcessor.getAllPosts();
	
	// Filter posts by year and month
	const posts = allPosts
		.filter(post => {
			const postDate = new Date(post.publishedAt);
			return postDate.getFullYear() === year && 
			       postDate.getMonth() + 1 === month;
		})
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	
	return {
		posts,
		year: year.toString(),
		month: month.toString().padStart(2, '0'),
		monthName: monthNames[month - 1]
	};
};