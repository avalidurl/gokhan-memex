<script lang="ts">
	import type { BlogPost } from '$lib/types/content';
	import { formatDate, formatReadingTime } from '$lib/utils/date';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		post: BlogPost;
		variant?: 'default' | 'featured' | 'compact';
		class?: string;
	}

	let { post, variant = 'default', class: className }: Props = $props();

	const postUrl = `/blog/${post.slug}`;
	const formattedDate = formatDate(post.publishedAt, { format: 'medium' });
	const readingTimeText = formatReadingTime(post.readingTime);
</script>

<Card 
	class={cn(
		"group hover:shadow-lg transition-all duration-200 overflow-hidden",
		variant === 'featured' && "border-2 border-primary/20",
		variant === 'compact' && "p-4",
		className
	)}
>
	{#if variant === 'featured' && post.image}
		<div class="aspect-video overflow-hidden rounded-t-lg -m-6 mb-4">
			<img 
				src={post.image} 
				alt={post.imageAlt || post.title}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				loading="lazy"
			/>
		</div>
	{/if}

	<div class={cn(variant !== 'compact' && "p-6", variant === 'featured' && "pt-0")}>
		<!-- Featured badge for featured posts -->
		{#if post.featured && variant !== 'compact'}
			<div class="mb-3">
				<Badge variant="default" class="bg-gradient-to-r from-violet-500 to-purple-600">
					Featured
				</Badge>
			</div>
		{/if}

		<!-- Categories -->
		{#if post.categories && post.categories.length > 0}
			<div class="mb-3 flex flex-wrap gap-2">
				{#each post.categories as category}
					<a 
						href="/blog/category/{category.toLowerCase().replace(/\s+/g, '-')}"
						class="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
					>
						{category}
					</a>
				{/each}
			</div>
		{/if}

		<!-- Title -->
		<h3 class={cn(
			"font-bold text-gray-900 dark:text-white mb-3 line-clamp-2",
			variant === 'featured' ? "text-2xl" : variant === 'compact' ? "text-lg" : "text-xl"
		)}>
			<a 
				href={postUrl} 
				class="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
			>
				{post.title}
			</a>
		</h3>

		<!-- Description/Excerpt -->
		{#if variant !== 'compact'}
			<p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
				{post.excerpt || post.description}
			</p>
		{/if}

		<!-- Tags -->
		{#if post.tags && post.tags.length > 0 && variant !== 'compact'}
			<div class="mb-4 flex flex-wrap gap-2">
				{#each post.tags.slice(0, 4) as tag}
					<a 
						href="/blog/tag/{tag.toLowerCase().replace(/\s+/g, '-')}"
						class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
					>
						#{tag}
					</a>
				{/each}
				{#if post.tags.length > 4}
					<span class="text-xs text-gray-400">+{post.tags.length - 4} more</span>
				{/if}
			</div>
		{/if}

		<!-- Meta information -->
		<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
			<div class="flex items-center space-x-4">
				<!-- Date -->
				<time datetime={post.publishedAt.toISOString()} class="flex items-center space-x-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
					<span>{formattedDate}</span>
				</time>

				<!-- Reading time -->
				<div class="flex items-center space-x-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
						<circle cx="12" cy="12" r="10"/>
					</svg>
					<span>{readingTimeText}</span>
				</div>
			</div>

			<!-- Series indicator -->
			{#if post.series}
				<div class="flex items-center space-x-1 text-violet-600 dark:text-violet-400">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
					</svg>
					<span class="text-xs font-medium">Part of series</span>
				</div>
			{/if}
		</div>

		<!-- Read more link for compact variant -->
		{#if variant === 'compact'}
			<div class="mt-3">
				<a 
					href={postUrl}
					class="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
				>
					Read more →
				</a>
			</div>
		{/if}
	</div>
</Card>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
