<script lang="ts">
	import type { PageData } from './$types';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	
	export let data: PageData;
	
	const { posts, year, months } = data;
</script>

<svelte:head>
	<title>Archive {year} - Gökhan Memex</title>
	<meta name="description" content="All posts from {year} in the Gökhan Memex archive." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center gap-4 mb-8">
			<a href="/archive" class="text-blue-600 dark:text-blue-400 hover:underline">
				← Archive
			</a>
			<h1 class="text-4xl font-bold">Posts from {year}</h1>
		</div>
		
		<div class="grid md:grid-cols-2 gap-8">
			<!-- Month Navigation -->
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold">Browse by Month</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each months as { month, monthName, count }}
						<a
							href="/archive/{year}/{month}"
							class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							<div class="text-lg font-semibold">{monthName}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">{count} posts</div>
						</a>
					{/each}
				</div>
			</div>
			
			<!-- All Posts for Year -->
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold">All Posts ({posts.length})</h2>
				<div class="space-y-6">
					{#each posts as post}
						<PostCard {post} />
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>