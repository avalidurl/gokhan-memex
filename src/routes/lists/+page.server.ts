import { readdir, readFile } from 'fs/promises';
import { parse } from 'js-yaml';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const files = await readdir('src/content/lists');
		const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
		
		const lists = await Promise.all(
			yamlFiles.map(async (file) => {
				try {
					const content = await readFile(`src/content/lists/${file}`, 'utf-8');
					const data = parse(content);
					return data;
				} catch (error) {
					console.error(`Error loading list ${file}:`, error);
					return null;
				}
			})
		);
		
		return {
			lists: lists.filter(Boolean).sort((a, b) => 
				new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
			)
		};
	} catch (error) {
		console.error('Error loading lists:', error);
		return {
			lists: []
		};
	}
};