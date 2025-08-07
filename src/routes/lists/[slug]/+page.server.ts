import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const content = await readFile(`src/content/lists/${params.slug}.yaml`, 'utf-8');
		const list = yaml.parse(content);
		
		return {
			list
		};
	} catch (err) {
		console.error(`Error loading list ${params.slug}:`, err);
		throw error(404, 'List not found');
	}
};