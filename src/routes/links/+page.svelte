<script lang="ts">
	import type { PageData } from './$types';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { ExternalLink, Star } from 'lucide-svelte';
	
	export let data: PageData;
	
	const { links, categories } = data;
	
	let selectedCategory = 'all';
	let showFeatured = false;
	
	$: filteredLinks = links.filter(link => {
		if (showFeatured && !link.featured) return false;
		if (selectedCategory === 'all') return true;
		return link.category === selectedCategory;
	});
	
	function getCategoryColor(categoryName: string) {
		const category = categories.find(c => c.name === categoryName);
		return category?.color || '#6b7280';
	}
</script>

<svelte:head>
	<title>Curated Links - Gökhan Memex</title>
	<meta name="description" content="A curated collection of valuable resources on crypto, economics, finance, and technology." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Curated Links</h1>
			<p class="text-lg text-gray-600 dark:text-gray-400">
				A carefully curated collection of valuable resources on crypto, economics, finance, and technology.
			</p>
		</div>
		
		<!-- Filters -->
		<div class="mb-8 space-y-4">
			<div class="flex flex-wrap gap-4 items-center">
				<div class="flex items-center gap-2">
					<button
						class="px-4 py-2 rounded-lg border transition-colors {selectedCategory === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}"
						onclick={() => selectedCategory = 'all'}
					>
						All ({links.length})
					</button>
					
					{#each categories as category}
						<button
							class="px-4 py-2 rounded-lg border transition-colors {selectedCategory === category.name ? 'text-white border-opacity-0' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}"
							style={selectedCategory === category.name ? `background-color: ${category.color}` : ''}
							onclick={() => selectedCategory = category.name}
						>
							{category.name} ({links.filter(l => l.category === category.name).length})
						</button>
					{/each}
				</div>
				
				<div class="flex items-center gap-2">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={showFeatured}
							class="rounded"
						/>
						<span class="text-sm">Featured only</span>
						<Star class="w-4 h-4 text-yellow-500" />
					</label>
				</div>
			</div>
		</div>
		
		<!-- Links Grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredLinks as link}
				<Card class="p-6 hover:shadow-lg transition-shadow">
					<div class="space-y-4">
						<!-- Header -->
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<h3 class="text-lg font-semibold">
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										class="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
									>
										{link.title}
										<ExternalLink class="w-4 h-4" />
									</a>
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{link.description}
								</p>
							</div>
							{#if link.featured}
								<Star class="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
							{/if}
						</div>
						
						<!-- Category Badge -->
						<div class="flex items-center gap-2">
							<Badge
								class="text-white"
								style="background-color: {getCategoryColor(link.category)}"
							>
								{link.category}
							</Badge>
						</div>
						
						<!-- Tags -->
						<div class="flex flex-wrap gap-2">
							{#each link.tags as tag}
								<Badge variant="outline" class="text-xs">
									{tag}
								</Badge>
							{/each}
						</div>
						
						<!-- Date Added -->
						<div class="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
							Added: {new Date(link.dateAdded).toLocaleDateString()}
						</div>
					</div>
				</Card>
			{/each}
		</div>
		
		{#if filteredLinks.length === 0}
			<div class="text-center py-12">
				<h2 class="text-2xl font-semibold mb-4">No links found</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Try adjusting your filters or check back later for new additions.
				</p>
				<button
					onclick={() => {selectedCategory = 'all'; showFeatured = false;}}
					class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Clear Filters
				</button>
			</div>
		{/if}
		
		<!-- Category Descriptions -->
		<div class="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			<h2 class="text-2xl font-semibold mb-6 md:col-span-2 lg:col-span-3">Categories</h2>
			{#each categories as category}
				<div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
					<h3 class="font-semibold mb-2 flex items-center gap-2">
						<div
							class="w-3 h-3 rounded-full"
							style="background-color: {category.color}"
						></div>
						{category.name}
					</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{category.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>