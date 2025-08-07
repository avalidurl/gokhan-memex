<script lang="ts">
	import type { PageData } from './$types';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	let searchQuery = $state(data.filters.search || '');

	function handleSearch(event: Event) {
		event.preventDefault();
		const url = new URL($page.url);
		
		if (searchQuery.trim()) {
			url.searchParams.set('search', searchQuery.trim());
		} else {
			url.searchParams.delete('search');
		}
		
		// Reset to page 1 when searching
		url.searchParams.delete('page');
		
		goto(url.toString());
	}

	function clearFilters() {
		const url = new URL($page.url);
		url.searchParams.delete('tag');
		url.searchParams.delete('category');
		url.searchParams.delete('search');
		url.searchParams.delete('featured');
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function navigateToPage(pageNum: number) {
		const url = new URL($page.url);
		if (pageNum === 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', pageNum.toString());
		}
		goto(url.toString());
	}

	// Calculate pagination range
	const paginationRange = $derived(() => {
		const { currentPage, totalPages } = data.pagination;
		const delta = 2;
		const range = [];
		
		for (let i = Math.max(2, currentPage - delta); 
			 i <= Math.min(totalPages - 1, currentPage + delta); 
			 i++) {
			range.push(i);
		}
		
		if (currentPage - delta > 2) {
			range.unshift('...');
		}
		if (currentPage + delta < totalPages - 1) {
			range.push('...');
		}
		
		range.unshift(1);
		if (totalPages !== 1) {
			range.push(totalPages);
		}
		
		return range;
	});

	const activeFilters = $derived(() => {
		const filters = [];
		if (data.filters.tag) filters.push({ type: 'tag', value: data.filters.tag });
		if (data.filters.category) filters.push({ type: 'category', value: data.filters.category });
		if (data.filters.search) filters.push({ type: 'search', value: data.filters.search });
		if (data.filters.featured) filters.push({ type: 'featured', value: 'Featured posts' });
		return filters;
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
			Blog
		</h1>
		<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
			Thoughts and insights on finance, art, and technology. Welcome to my digital garden.
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="mb-8">
		<!-- Search Bar -->
		<form onsubmit={handleSearch} class="mb-6">
			<div class="flex gap-3 max-w-lg">
				<Input 
					bind:value={searchQuery}
					placeholder="Search posts..."
					class="flex-1"
				/>
				<Button type="submit">
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
					Search
				</Button>
			</div>
		</form>

		<!-- Active Filters -->
		{#if activeFilters.length > 0}
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
				{#each activeFilters as filter}
					<Badge variant="secondary" class="flex items-center gap-1">
						{filter.type === 'tag' ? '#' : ''}{filter.value}
						<button 
							onclick={() => {
								const url = new URL($page.url);
								url.searchParams.delete(filter.type);
								goto(url.toString());
							}}
							class="ml-1 hover:text-red-500"
						>
							×
						</button>
					</Badge>
				{/each}
				<Button variant="ghost" size="sm" onclick={clearFilters}>
					Clear all
				</Button>
			</div>
		{/if}

		<!-- Quick Filters -->
		<div class="flex flex-wrap gap-3">
			<Button 
				variant={data.filters.featured ? 'default' : 'outline'} 
				size="sm"
				href="?featured=true"
			>
				⭐ Featured
			</Button>
			{#each data.sidebar.categories.slice(0, 4) as category}
				<Button 
					variant={data.filters.category === category.name ? 'default' : 'outline'} 
					size="sm"
					href="?category={encodeURIComponent(category.name)}"
				>
					{category.name} ({category.count})
				</Button>
			{/each}
		</div>
	</div>

	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Main Content -->
		<main class="flex-1">
			<!-- Results Summary -->
			<div class="mb-6 text-sm text-gray-600 dark:text-gray-400">
				{#if data.filters.search}
					Found {data.pagination.totalPosts} results for "{data.filters.search}"
				{:else}
					Showing {data.posts.length} of {data.pagination.totalPosts} posts
				{/if}
			</div>

			<!-- Posts Grid -->
			{#if data.posts.length > 0}
				<div class="space-y-6">
					{#each data.posts as post, index}
						<PostCard 
							{post} 
							variant={index === 0 && data.pagination.currentPage === 1 && !activeFilters.length ? 'featured' : 'default'}
						/>
					{/each}
				</div>

				<!-- Pagination -->
				{#if data.pagination.totalPages > 1}
					<div class="mt-12 flex justify-center">
						<nav class="flex items-center space-x-2">
							<!-- Previous -->
							<Button 
								variant="outline" 
								size="sm"
								disabled={!data.pagination.hasPrevPage}
								onclick={() => navigateToPage(data.pagination.currentPage - 1)}
							>
								← Previous
							</Button>

							<!-- Page Numbers -->
							{#each paginationRange as pageNum}
								{#if pageNum === '...'}
									<span class="px-3 py-2 text-gray-400">...</span>
								{:else}
									<Button 
										variant={pageNum === data.pagination.currentPage ? 'default' : 'outline'}
										size="sm"
										onclick={() => navigateToPage(pageNum)}
									>
										{pageNum}
									</Button>
								{/if}
							{/each}

							<!-- Next -->
							<Button 
								variant="outline" 
								size="sm"
								disabled={!data.pagination.hasNextPage}
								onclick={() => navigateToPage(data.pagination.currentPage + 1)}
							>
								Next →
							</Button>
						</nav>
					</div>
				{/if}
			{:else}
				<!-- Empty State -->
				<div class="text-center py-12">
					<svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
					</svg>
					<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
						No posts found
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						{#if activeFilters.length > 0}
							Try adjusting your filters or search terms.
						{:else}
							Check back soon for new content!
						{/if}
					</p>
					{#if activeFilters.length > 0}
						<Button onclick={clearFilters}>
							Clear filters
						</Button>
					{/if}
				</div>
			{/if}
		</main>

		<!-- Sidebar -->
		<aside class="lg:w-80">
			<div class="sticky top-8 space-y-8">
				<!-- Popular Tags -->
				{#if data.sidebar.tags.length > 0}
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
						<div class="flex flex-wrap gap-2">
							{#each data.sidebar.tags as tag}
								<a 
									href="?tag={encodeURIComponent(tag.name)}"
									class="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
								>
									#{tag.name}
									<span class="ml-1 text-xs text-gray-500">({tag.count})</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<Separator />

				<!-- Categories -->
				{#if data.sidebar.categories.length > 0}
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
						<div class="space-y-2">
							{#each data.sidebar.categories as category}
								<a 
									href="?category={encodeURIComponent(category.name)}"
									class="flex items-center justify-between p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<span>{category.name}</span>
									<Badge variant="secondary" class="text-xs">
										{category.count}
									</Badge>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</aside>
	</div>
</div>
