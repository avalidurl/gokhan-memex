<script lang="ts">
	import type { PageData } from './$types';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import { Badge } from '$lib/components/ui/badge';
	
	export let data: PageData;
	
	const { posts, tag, relatedTags } = data;
</script>

<svelte:head>
	<title>Posts tagged "{tag}" - Gökhan Memex</title>
	<meta name="description" content="All posts tagged with {tag} in the Gökhan Memex." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center gap-4 mb-8">
			<a href="/blog" class="text-blue-600 dark:text-blue-400 hover:underline">
				← Blog
			</a>
		</div>
		
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">
				Posts tagged 
				<Badge class="text-lg px-3 py-1 ml-2">{tag}</Badge>
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				{posts.length} post{posts.length === 1 ? '' : 's'} found
			</p>
		</div>
		
		{#if relatedTags.length > 0}
			<div class="mb-8">
				<h2 class="text-lg font-semibold mb-4">Related Tags</h2>
				<div class="flex flex-wrap gap-2">
					{#each relatedTags as relatedTag}
						<a href="/blog/tag/{relatedTag.name}">
							<Badge variant="outline" class="hover:bg-gray-50 dark:hover:bg-gray-800">
								{relatedTag.name} ({relatedTag.count})
							</Badge>
						</a>
					{/each}
				</div>
			</div>
		{/if}
		
		<div class="space-y-8">
			{#each posts as post}
				<PostCard {post} />
			{/each}
		</div>
		
		{#if posts.length === 0}
			<div class="text-center py-12">
				<h2 class="text-2xl font-semibold mb-4">No posts found</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					There are no posts with the tag "{tag}".
				</p>
				<a 
					href="/blog" 
					class="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Browse All Posts
				</a>
			</div>
		{/if}
	</div>
</div>