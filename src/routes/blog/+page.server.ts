import type { PageServerLoad } from './$types';
import { contentProcessor } from '$lib/utils/content';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const tag = url.searchParams.get('tag');
	const category = url.searchParams.get('category');
	const search = url.searchParams.get('search');
	const featured = url.searchParams.get('featured') === 'true' ? true : undefined;
	
	const postsPerPage = 10;
	const offset = (page - 1) * postsPerPage;

	try {
		let posts;
		let totalPosts = 0;

		if (search) {
			// Search posts
			const searchResults = await contentProcessor.searchPosts(search);
			posts = searchResults.slice(offset, offset + postsPerPage);
			totalPosts = searchResults.length;
		} else {
			// Get posts with filters
			const filterOptions = {
				limit: postsPerPage,
				offset,
				tags: tag ? [tag] : undefined,
				category,
				featured,
				includeDrafts: false
			};

			posts = await contentProcessor.getAllPosts(filterOptions);
			
			// Get total count for pagination (approximate)
			const allFilteredPosts = await contentProcessor.getAllPosts({
				tags: tag ? [tag] : undefined,
				category,
				featured,
				includeDrafts: false
			});
			totalPosts = allFilteredPosts.length;
		}

		// Get tags and categories for sidebar
		const [allTags, allCategories] = await Promise.all([
			contentProcessor.getAllTags(),
			contentProcessor.getAllCategories()
		]);

		const totalPages = Math.ceil(totalPosts / postsPerPage);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts,
			pagination: {
				currentPage: page,
				totalPages,
				hasNextPage,
				hasPrevPage,
				totalPosts
			},
			filters: {
				tag,
				category,
				search,
				featured
			},
			sidebar: {
				tags: allTags.slice(0, 20), // Top 20 tags
				categories: allCategories
			},
			meta: {
				title: getPageTitle({ tag, category, search, featured, page }),
				description: getPageDescription({ tag, category, search, featured }),
				type: 'website' as const
			}
		};
	} catch (error) {
		console.error('Error loading blog posts:', error);
		return {
			posts: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				hasNextPage: false,
				hasPrevPage: false,
				totalPosts: 0
			},
			filters: {
				tag: null,
				category: null,
				search: null,
				featured: undefined
			},
			sidebar: {
				tags: [],
				categories: []
			},
			meta: {
				title: 'Blog - Gökhan Memex',
				description: 'Thoughts on finance, art, and technology from Gökhan Turhan.',
				type: 'website' as const
			}
		};
	}
};

function getPageTitle({ tag, category, search, featured, page }: {
	tag?: string | null;
	category?: string | null;
	search?: string | null;
	featured?: boolean;
	page: number;
}): string {
	let title = 'Blog';
	
	if (search) {
		title = `Search: "${search}"`;
	} else if (tag) {
		title = `#${tag}`;
	} else if (category) {
		title = category;
	} else if (featured) {
		title = 'Featured Posts';
	}
	
	if (page > 1) {
		title += ` - Page ${page}`;
	}
	
	return `${title} - Gökhan Memex`;
}

function getPageDescription({ tag, category, search, featured }: {
	tag?: string | null;
	category?: string | null;
	search?: string | null;
	featured?: boolean;
}): string {
	if (search) {
		return `Search results for "${search}" in Gökhan's digital garden.`;
	}
	
	if (tag) {
		return `Posts tagged with "${tag}" - exploring finance, art, and technology.`;
	}
	
	if (category) {
		return `Posts in the "${category}" category - insights and analysis.`;
	}
	
	if (featured) {
		return 'Featured posts from Gökhan\'s digital garden - the best content on finance, art, and technology.';
	}
	
	return 'Thoughtful content on finance, art, and technology from Gökhan Turhan\'s digital garden.';
}
