import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const linksContent = await readFile('src/content/links.yaml', 'utf-8');
		const data = yaml.parse(linksContent) as {
			links: Array<{
				title: string;
				url: string;
				description: string;
				category: string;
				tags: string[];
				dateAdded: string;
				featured: boolean;
			}>;
			categories: Array<{
				name: string;
				description: string;
				color: string;
			}>;
		};
		
		// Sort links by featured first, then by date added (newest first)
		const sortedLinks = data.links.sort((a, b) => {
			if (a.featured && !b.featured) return -1;
			if (!a.featured && b.featured) return 1;
			return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
		});
		
		return {
			links: sortedLinks,
			categories: data.categories
		};
	} catch (error) {
		console.error('Error loading links:', error);
		return {
			links: [],
			categories: []
		};
	}
};