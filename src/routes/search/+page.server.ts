import { ContentProcessor } from '$lib/utils/content';
import { readFile, readdir } from 'fs/promises';
import { parse } from 'js-yaml';
import Fuse from 'fuse.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim();
	
	if (!query) {
		return {
			results: [],
			query: '',
			totalResults: 0
		};
	}
	
	try {
		// Get blog posts
		const contentProcessor = new ContentProcessor();
		const posts = await contentProcessor.getAllPosts();
		
		// Get links
		let links = [];
		try {
			const linksContent = await readFile('src/content/links.yaml', 'utf-8');
			const linksData = parse(linksContent) as { links: any[] };
			links = linksData.links.map(link => ({ ...link, type: 'link' }));
		} catch (error) {
			console.error('Error loading links:', error);
		}
		
		// Get lists
		let lists = [];
		try {
			const files = await readdir('src/content/lists');
			const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
			
			const listPromises = yamlFiles.map(async (file) => {
				try {
					const content = await readFile(`src/content/lists/${file}`, 'utf-8');
					const data = parse(content);
					return { ...data, type: 'list' };
				} catch (error) {
					return null;
				}
			});
			
			const loadedLists = await Promise.all(listPromises);
			lists = loadedLists.filter(Boolean);
		} catch (error) {
			console.error('Error loading lists:', error);
		}
		
		// Prepare search data
		const searchData = [
			...posts.map(post => ({
				...post,
				type: 'post',
				searchableText: `${post.title} ${post.description} ${post.content}`,
			})),
			...links.map(link => ({
				...link,
				searchableText: `${link.title} ${link.description} ${link.tags.join(' ')}`,
			})),
			...lists.map(list => ({
				...list,
				searchableText: `${list.title} ${list.description} ${list.tags.join(' ')}`,
			}))
		];
		
		// Configure Fuse.js for fuzzy search
		const fuse = new Fuse(searchData, {
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.3 },
				{ name: 'searchableText', weight: 0.3 },
			],
			threshold: 0.4,
			includeScore: true,
			minMatchCharLength: 2,
		});
		
		// Perform search
		const searchResults = fuse.search(query);
		const results = searchResults.map(result => result.item);
		
		return {
			results,
			query,
			totalResults: results.length
		};
	} catch (error) {
		console.error('Search error:', error);
		return {
			results: [],
			query,
			totalResults: 0
		};
	}
};