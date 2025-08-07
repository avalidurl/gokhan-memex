<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { Button } from '$lib/components/ui/button';
	
	export let data: PageData;
	
	const { results, query, totalResults } = data;
	
	let searchQuery = query || '';
	
	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}
	
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
</script>

<svelte:head>
	<title>Search{query ? ` - ${query}` : ''} - Gökhan Memex</title>
	<meta name="description" content="Search through all content in the Gökhan Memex digital garden." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold mb-8">Search</h1>
		
		<!-- Search Form -->
		<div class="mb-8">
			<div class="flex gap-4">
				<Input
					type="text"
					placeholder="Search posts, links, and lists..."
					bind:value={searchQuery}
					onkeypress={handleKeyPress}
					class="flex-1"
				/>
				<Button onclick={handleSearch}>
					Search
				</Button>
			</div>
		</div>
		
		{#if query}
			<!-- Results -->
			<div class="mb-6">
				<h2 class="text-2xl font-semibold mb-4">
					Search Results for "{query}"
				</h2>
				{#if totalResults > 0}
					<p class="text-gray-600 dark:text-gray-400">
						Found {totalResults} result{totalResults === 1 ? '' : 's'}
					</p>
				{/if}
			</div>
			
			{#if results.length === 0}
				<div class="text-center py-12">
					<h3 class="text-xl font-semibold mb-4">No results found</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						Try adjusting your search terms or browse all content.
					</p>
					<div class="space-x-4">
						<Button variant="outline" onclick={() => goto('/blog')}>
							Browse Posts
						</Button>
						<Button variant="outline" onclick={() => goto('/links')}>
							Browse Links
						</Button>
						<Button variant="outline" onclick={() => goto('/lists')}>
							Browse Lists
						</Button>
					</div>
				</div>
			{:else}
				<div class="space-y-8">
					{#each results as result}
						{#if result.type === 'post'}
							<PostCard post={result} />
						{:else if result.type === 'link'}
							<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
								<h3 class="text-xl font-semibold mb-2">
									<a
										href={result.url}
										target="_blank"
										rel="noopener noreferrer"
										class="hover:text-blue-600 dark:hover:text-blue-400"
									>
										{result.title}
									</a>
								</h3>
								<p class="text-gray-600 dark:text-gray-400 mb-2">
									{result.description}
								</p>
								<div class="text-sm text-gray-500 dark:text-gray-400">
									Link • {result.category}
								</div>
							</div>
						{:else if result.type === 'list'}
							<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
								<h3 class="text-xl font-semibold mb-2">
									<a
										href="/lists/{result.slug}"
										class="hover:text-blue-600 dark:hover:text-blue-400"
									>
										{result.title}
									</a>
								</h3>
								<p class="text-gray-600 dark:text-gray-400 mb-2">
									{result.description}
								</p>
								<div class="text-sm text-gray-500 dark:text-gray-400">
									Reading List • {result.items?.length || 0} items
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{:else}
			<!-- No Search Query -->
			<div class="text-center py-12">
				<h2 class="text-2xl font-semibold mb-4">What are you looking for?</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-8">
					Search through blog posts, curated links, and reading lists.
				</p>
				<div class="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
					<div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
						<h3 class="font-semibold mb-2">Blog Posts</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Search through all published articles and thoughts.
						</p>
					</div>
					<div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
						<h3 class="font-semibold mb-2">Curated Links</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Find relevant external resources and references.
						</p>
					</div>
					<div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
						<h3 class="font-semibold mb-2">Reading Lists</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Discover curated collections and recommendations.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>