<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	
	export let data: PageData;
	
	const { list } = data;
</script>

<svelte:head>
	<title>{list.title} - Gökhan Memex</title>
	<meta name="description" content={list.description} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center gap-4 mb-8">
			<a href="/lists" class="text-blue-600 dark:text-blue-400 hover:underline">
				← Lists
			</a>
		</div>
		
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">{list.title}</h1>
			<p class="text-lg text-gray-600 dark:text-gray-400 mb-4">
				{list.description}
			</p>
			
			<div class="flex flex-wrap gap-2 mb-4">
				{#each list.tags as tag}
					<Badge variant="outline">{tag}</Badge>
				{/each}
			</div>
			
			<div class="text-sm text-gray-500 dark:text-gray-400">
				Created: {new Date(list.dateCreated).toLocaleDateString()} •
				Updated: {new Date(list.dateUpdated).toLocaleDateString()} •
				{list.items.length} items
			</div>
		</div>
		
		<div class="space-y-6">
			{#each list.items as item, index}
				<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<h3 class="text-xl font-semibold mb-2">
								{#if item.url}
									<a
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
										class="hover:text-blue-600 dark:hover:text-blue-400"
									>
										{item.title}
									</a>
								{:else}
									{item.title}
								{/if}
							</h3>
							{#if item.author}
								<p class="text-gray-600 dark:text-gray-400 mb-2">
									by {item.author}
								</p>
							{/if}
							<p class="text-gray-600 dark:text-gray-400">
								{item.description}
							</p>
						</div>
						<div class="flex flex-col items-end gap-2 ml-4">
							<Badge variant="outline">{item.type}</Badge>
							{#if item.priority}
								<Badge 
									class={item.priority === 'essential' ? 'bg-red-100 text-red-800' : 
									       item.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
									       'bg-blue-100 text-blue-800'}
								>
									{item.priority}
								</Badge>
							{/if}
							{#if item.completed}
								<Badge class="bg-green-100 text-green-800">✓ Complete</Badge>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>