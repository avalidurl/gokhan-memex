<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	const { lists } = data;
</script>

<svelte:head>
	<title>Reading Lists - Gökhan Memex</title>
	<meta name="description" content="Curated reading lists and collections on various topics." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold mb-8">Reading Lists</h1>
		
		{#if lists.length === 0}
			<div class="text-center py-12">
				<h2 class="text-2xl font-semibold mb-4">No lists available</h2>
				<p class="text-gray-600 dark:text-gray-400">
					Reading lists will be added here soon.
				</p>
			</div>
		{:else}
			<div class="space-y-8">
				{#each lists as list}
					<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
						<h2 class="text-2xl font-semibold mb-2">
							<a href="/lists/{list.slug}" class="hover:text-blue-600 dark:hover:text-blue-400">
								{list.title}
							</a>
						</h2>
						<p class="text-gray-600 dark:text-gray-400 mb-4">
							{list.description}
						</p>
						<div class="text-sm text-gray-500 dark:text-gray-400">
							{list.items.length} items • Updated {new Date(list.dateUpdated).toLocaleDateString()}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>