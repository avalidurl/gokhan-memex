<script lang="ts">
	import type { PageData } from './$types';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	
	export let data: PageData;
	
	const { posts, year, month, monthName } = data;
</script>

<svelte:head>
	<title>Archive {monthName} {year} - Gökhan Memex</title>
	<meta name="description" content="All posts from {monthName} {year} in the Gökhan Memex archive." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center gap-4 mb-8">
			<a href="/archive" class="text-blue-600 dark:text-blue-400 hover:underline">
				Archive
			</a>
			<span class="text-gray-400">→</span>
			<a href="/archive/{year}" class="text-blue-600 dark:text-blue-400 hover:underline">
				{year}
			</a>
			<span class="text-gray-400">→</span>
			<h1 class="text-4xl font-bold">{monthName}</h1>
		</div>
		
		<div class="mb-6">
			<p class="text-gray-600 dark:text-gray-400">
				{posts.length} post{posts.length === 1 ? '' : 's'} from {monthName} {year}
			</p>
		</div>
		
		<div class="space-y-8">
			{#each posts as post}
				<PostCard {post} />
			{/each}
		</div>
		
		{#if posts.length === 0}
			<div class="text-center py-12">
				<h2 class="text-2xl font-semibold mb-4">No posts found</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					There are no posts from {monthName} {year}.
				</p>
				<a 
					href="/archive/{year}" 
					class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Browse other months in {year}
				</a>
			</div>
		{/if}
	</div>
</div>