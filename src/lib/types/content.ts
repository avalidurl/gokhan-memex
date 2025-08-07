// Core content types for the memex system

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	content: string;
	excerpt?: string;
	publishedAt: Date;
	updatedAt?: Date;
	author: string;
	tags: string[];
	categories: string[];
	series?: string;
	seriesOrder?: number;
	featured: boolean;
	draft: boolean;
	readingTime: number;
	wordCount: number;
	image?: string;
	imageAlt?: string;
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string;
	};
	related?: string[];
	backlinks?: string[];
}

export interface BlogPostFrontmatter {
	title: string;
	description: string;
	publishedAt: string;
	updatedAt?: string;
	author?: string;
	tags?: string[];
	categories?: string[];
	series?: string;
	seriesOrder?: number;
	featured?: boolean;
	draft?: boolean;
	image?: string;
	imageAlt?: string;
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string;
	};
}

export interface Link {
	id: string;
	url: string;
	title: string;
	description?: string;
	tags: string[];
	category: string;
	addedAt: Date;
	author?: string;
	source?: string;
	notes?: string;
	archived: boolean;
	favicon?: string;
	preview?: {
		title: string;
		description: string;
		image?: string;
		domain: string;
	};
}

export interface ReadingList {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	createdAt: Date;
	updatedAt?: Date;
	items: ReadingListItem[];
	public: boolean;
	featured: boolean;
}

export interface ReadingListItem {
	type: 'book' | 'article' | 'video' | 'podcast' | 'paper';
	title: string;
	author?: string;
	url?: string;
	description?: string;
	completed: boolean;
	rating?: number;
	notes?: string;
	addedAt: Date;
}

export interface Page {
	slug: string;
	title: string;
	description: string;
	content: string;
	publishedAt: Date;
	updatedAt?: Date;
	template?: 'default' | 'full-width' | 'minimal';
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string;
	};
}

export interface Tag {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	count: number;
	relatedTags?: string[];
}

export interface Category {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	count: number;
	parent?: string;
	children?: string[];
}

export interface Series {
	name: string;
	slug: string;
	description: string;
	posts: string[];
	totalPosts: number;
	completedPosts: number;
	startDate: Date;
	endDate?: Date;
}

export interface SearchResult {
	type: 'post' | 'page' | 'link' | 'list';
	slug: string;
	title: string;
	description: string;
	url: string;
	relevanceScore: number;
	excerpt?: string;
	tags?: string[];
	publishedAt?: Date;
}

export interface ContentStats {
	totalPosts: number;
	totalWords: number;
	totalReadingTime: number;
	totalTags: number;
	totalCategories: number;
	totalLinks: number;
	totalLists: number;
	postsThisMonth: number;
	postsThisYear: number;
	averageWordsPerPost: number;
	mostUsedTags: Array<{ tag: string; count: number }>;
	postsByMonth: Array<{ month: string; count: number }>;
}

// Utility types
export type ContentType = 'post' | 'page' | 'link' | 'list';

export interface ContentMeta {
	title: string;
	description: string;
	keywords?: string;
	author?: string;
	image?: string;
	type?: 'website' | 'article' | 'blog';
	publishedTime?: string;
	modifiedTime?: string;
	section?: string;
	tags?: string[];
}

export interface Breadcrumb {
	label: string;
	href: string;
}
