import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { BlogPost, BlogPostFrontmatter } from '$lib/types/content';

/**
 * ContentProcessor class handles all content operations for the memex
 */
export class ContentProcessor {
	private static instance: ContentProcessor;
	private postsCache: Map<string, BlogPost> = new Map();
	private contentPath = 'src/content';

	private constructor() {}

	static getInstance(): ContentProcessor {
		if (!ContentProcessor.instance) {
			ContentProcessor.instance = new ContentProcessor();
		}
		return ContentProcessor.instance;
	}

	/**
	 * Get all blog posts with optional filtering and sorting
	 */
	async getAllPosts(options: {
		limit?: number;
		offset?: number;
		sortBy?: 'date' | 'title' | 'readingTime';
		sortOrder?: 'asc' | 'desc';
		includeDrafts?: boolean;
		tags?: string[];
		category?: string;
		featured?: boolean;
	} = {}): Promise<BlogPost[]> {
		const {
			limit,
			offset = 0,
			sortBy = 'date',
			sortOrder = 'desc',
			includeDrafts = false,
			tags,
			category,
			featured
		} = options;

		let posts = await this.loadAllPosts();

		// Filter drafts
		if (!includeDrafts) {
			posts = posts.filter(post => !post.draft);
		}

		// Filter by featured
		if (featured !== undefined) {
			posts = posts.filter(post => post.featured === featured);
		}

		// Filter by tags
		if (tags && tags.length > 0) {
			posts = posts.filter(post => 
				tags.some(tag => post.tags.includes(tag))
			);
		}

		// Filter by category
		if (category) {
			posts = posts.filter(post => 
				post.categories.includes(category)
			);
		}

		// Sort posts
		posts.sort((a, b) => {
			let comparison = 0;
			
			switch (sortBy) {
				case 'date':
					comparison = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
					break;
				case 'title':
					comparison = a.title.localeCompare(b.title);
					break;
				case 'readingTime':
					comparison = a.readingTime - b.readingTime;
					break;
			}

			return sortOrder === 'desc' ? comparison : -comparison;
		});

		// Apply pagination
		const start = offset;
		const end = limit ? start + limit : undefined;

		return posts.slice(start, end);
	}

	/**
	 * Get a single post by slug
	 */
	async getPostBySlug(slug: string): Promise<BlogPost | null> {
		const posts = await this.loadAllPosts();
		return posts.find(post => post.slug === slug) || null;
	}

	/**
	 * Get posts by tag
	 */
	async getPostsByTag(tag: string, limit?: number): Promise<BlogPost[]> {
		return this.getAllPosts({
			tags: [tag],
			limit,
			includeDrafts: false
		});
	}

	/**
	 * Get posts by category
	 */
	async getPostsByCategory(category: string, limit?: number): Promise<BlogPost[]> {
		return this.getAllPosts({
			category,
			limit,
			includeDrafts: false
		});
	}

	/**
	 * Get related posts based on tags and categories
	 */
	async getRelatedPosts(post: BlogPost, limit: number = 3): Promise<BlogPost[]> {
		const allPosts = await this.getAllPosts({ includeDrafts: false });
		
		// Filter out the current post
		const otherPosts = allPosts.filter(p => p.slug !== post.slug);

		// Calculate relevance score based on shared tags and categories
		const scoredPosts = otherPosts.map(otherPost => {
			let score = 0;
			
			// Score for shared tags
			const sharedTags = post.tags.filter(tag => otherPost.tags.includes(tag));
			score += sharedTags.length * 2;
			
			// Score for shared categories
			const sharedCategories = post.categories.filter(cat => otherPost.categories.includes(cat));
			score += sharedCategories.length * 3;

			// Boost for same series
			if (post.series && post.series === otherPost.series) {
				score += 5;
			}

			return { post: otherPost, score };
		});

		// Sort by score and return top results
		return scoredPosts
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map(item => item.post);
	}

	/**
	 * Get all unique tags with post counts
	 */
	async getAllTags(): Promise<Array<{ name: string; count: number }>> {
		const posts = await this.getAllPosts({ includeDrafts: false });
		const tagCounts = new Map<string, number>();

		posts.forEach(post => {
			post.tags.forEach(tag => {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			});
		});

		return Array.from(tagCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * Get all unique categories with post counts
	 */
	async getAllCategories(): Promise<Array<{ name: string; count: number }>> {
		const posts = await this.getAllPosts({ includeDrafts: false });
		const categoryCounts = new Map<string, number>();

		posts.forEach(post => {
			post.categories.forEach(category => {
				categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
			});
		});

		return Array.from(categoryCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * Search posts by title, description, and content
	 */
	async searchPosts(query: string, limit?: number): Promise<BlogPost[]> {
		const posts = await this.getAllPosts({ includeDrafts: false });
		const lowercaseQuery = query.toLowerCase();

		const matchedPosts = posts.filter(post => {
			return (
				post.title.toLowerCase().includes(lowercaseQuery) ||
				post.description.toLowerCase().includes(lowercaseQuery) ||
				post.content.toLowerCase().includes(lowercaseQuery) ||
				post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
				post.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
			);
		});

		return limit ? matchedPosts.slice(0, limit) : matchedPosts;
	}

	/**
	 * Load all posts from the filesystem
	 */
	private async loadAllPosts(): Promise<BlogPost[]> {
		try {
			const blogPath = join(process.cwd(), this.contentPath, 'blog');
			const filenames = readdirSync(blogPath);
			const posts: BlogPost[] = [];

			for (const filename of filenames) {
				if (!filename.endsWith('.mdx')) continue;

				const slug = filename.replace('.mdx', '');
				
				// Check cache first
				if (this.postsCache.has(slug)) {
					posts.push(this.postsCache.get(slug)!);
					continue;
				}

				const filepath = join(blogPath, filename);
				const fileContent = readFileSync(filepath, 'utf-8');
				const { data: frontmatter, content } = matter(fileContent);

				const post = this.processPost(slug, frontmatter as BlogPostFrontmatter, content);
				
				// Cache the post
				this.postsCache.set(slug, post);
				posts.push(post);
			}

			return posts;
		} catch (error) {
			console.error('Error loading posts:', error);
			return [];
		}
	}

	/**
	 * Process a single post with all metadata
	 */
	private processPost(slug: string, frontmatter: BlogPostFrontmatter, content: string): BlogPost {
		// Calculate reading time (approximate)
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const readingTime = Math.ceil(wordCount / wordsPerMinute);

		// Generate excerpt if not provided
		let excerpt = frontmatter.description;
		if (!excerpt && content) {
			const plainText = content
				.replace(/```[\s\S]*?```/g, '') // Remove code blocks
				.replace(/`[^`]+`/g, '') // Remove inline code
				.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
				.replace(/[#*_~]/g, '') // Remove markdown formatting
				.trim();
			
			excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');
		}

		return {
			slug,
			title: frontmatter.title,
			description: frontmatter.description,
			content,
			excerpt,
			publishedAt: new Date(frontmatter.publishedAt),
			updatedAt: frontmatter.updatedAt ? new Date(frontmatter.updatedAt) : undefined,
			author: frontmatter.author || 'Gökhan Turhan',
			tags: frontmatter.tags || [],
			categories: frontmatter.categories ? [frontmatter.categories] : [],
			series: frontmatter.series,
			seriesOrder: frontmatter.seriesOrder,
			featured: frontmatter.featured || false,
			draft: frontmatter.draft || false,
			readingTime,
			wordCount,
			image: frontmatter.image,
			imageAlt: frontmatter.imageAlt,
			seo: frontmatter.seo,
			related: [],
			backlinks: []
		};
	}

	/**
	 * Clear the cache (useful for development)
	 */
	clearCache(): void {
		this.postsCache.clear();
	}
}

// Export singleton instance
export const contentProcessor = ContentProcessor.getInstance();
