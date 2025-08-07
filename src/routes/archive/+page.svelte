<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate } from '$lib/utils/date';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	
	export let data: PageData;
	
	const { posts, years } = data;
</script>

<svelte:head>
	<title>Archive - Gökhan Memex</title>
	<meta name="description" content="Browse all posts by year and month in the Gökhan Memex archive." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold mb-8">Archive</h1>
		
		<div class="grid md:grid-cols-2 gap-8">
			<!-- Year Navigation -->
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold">Browse by Year</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each years as { year, count }}
						<a
							href="/archive/{year}"
							class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							<div class="text-xl font-semibold">{year}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">{count} posts</div>
						</a>
					{/each}
				</div>
			</div>
			
			<!-- Recent Posts -->
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold">Recent Posts</h2>
				<div class="space-y-4">
					{#each posts.slice(0, 5) as post}
						<div class="border-l-2 border-blue-500 pl-4">
							<h3 class="font-semibold">
								<a href="/blog/{post.slug}" class="hover:text-blue-600 dark:hover:text-blue-400">
									{post.title}
								</a>
							</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{formatDate(post.publishedAt)}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>