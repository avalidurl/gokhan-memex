<script lang="ts">
	import { onMount } from 'svelte';
	
	let posts = $state([]);
	let loading = $state(true);
	
	onMount(async () => {
		try {
			// For now, we'll just show the existing blog posts
			// TODO: Load posts from content processing system
			loading = false;
		} catch (error) {
			console.error('Error loading posts:', error);
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Home - Gökhan Memex</title>
	<meta name="description" content="Welcome to Gökhan's digital garden - a curated collection of thoughts on finance, art, and technology." />
</svelte:head>

<div class="container mx-auto px-4 py-12">
	<!-- Hero Section -->
	<section class="text-center mb-16">
		<h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-6 animate-fade-in">
			Gökhan's <span class="text-primary">Digital Garden</span>
		</h1>
		<div class="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed animate-slide-up">
			<p class="text-muted-foreground">
				I am a T-shaped generalist solopreneur, researcher, and conceptual artist operating across fintech, deep tech, competitive governance, art markets, and investment strategies. My research focuses on stablecoins, RWAs, tokenization, cryptography, AGI timelines, and global systemic challenges.
			</p>
			<p class="text-muted-foreground">
				My main areas of interest converge upon the junction of stablecoins, real assets, tokenization, information markets, sabermetrics, and the ever-emergent art of investment.
			</p>
			<p class="text-muted-foreground">
				I enjoy heavy training, running, cooking, sound art, cars, and history. I believe in the deep tech causes that will unconditionally accelerate our species toward a Kardashev-scale immediate future.
			</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
			<a 
				href="/blog" 
				class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
			>
				Read My Research
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</a>
			<a 
				href="/links" 
				class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
				</svg>
				Links & Resources
			</a>
		</div>
	</section>
	
	<!-- Features Section -->
	<section class="grid md:grid-cols-3 gap-8 mb-16">
		<div class="card text-center">
			<div class="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
				<svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
				</svg>
			</div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Thoughtful Writing</h3>
			<p class="text-gray-600 dark:text-gray-300">
				In-depth articles exploring the intersection of finance, technology, and creative expression.
			</p>
		</div>
		
		<div class="card text-center">
			<div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
				<svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
				</svg>
			</div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Connected Ideas</h3>
			<p class="text-gray-600 dark:text-gray-300">
				Every piece of content is interconnected, creating a web of knowledge that grows over time.
			</p>
		</div>
		
		<div class="card text-center">
			<div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
				<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
				</svg>
			</div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Discoverable</h3>
			<p class="text-gray-600 dark:text-gray-300">
				Advanced search and tagging system helps you find exactly what you're looking for.
			</p>
		</div>
	</section>
	
	<!-- Recent Posts Section -->
	<section class="mb-16">
		<div class="flex justify-between items-center mb-8">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Recent Thoughts</h2>
			<a href="/blog" class="text-violet-600 dark:text-violet-400 hover:underline font-medium">
				View all posts →
			</a>
		</div>
		
		{#if loading}
			<div class="grid md:grid-cols-2 gap-6">
				{#each Array(4) as _}
					<div class="card">
						<div class="animate-pulse">
							<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
							<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
							<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- TODO: Replace with actual blog posts -->
			<div class="grid md:grid-cols-2 gap-6">
				<div class="card hover:shadow-lg transition-shadow duration-200">
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
						<a href="/blog/sample-post" class="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
							Building a Modern Digital Garden
						</a>
					</h3>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						Exploring the philosophy and implementation of digital gardens using modern web technologies...
					</p>
					<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
						<time>Dec 15, 2024</time>
						<span>5 min read</span>
					</div>
				</div>
				
				<div class="card hover:shadow-lg transition-shadow duration-200">
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
						<a href="/blog/sample-post-2" class="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
							The Future of Creative Technology
						</a>
					</h3>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						How emerging technologies are reshaping creative expression and artistic practice...
					</p>
					<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
						<time>Dec 10, 2024</time>
						<span>8 min read</span>
					</div>
				</div>
			</div>
		{/if}
	</section>
	
	<!-- Newsletter Section -->
	<section class="card text-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-200 dark:border-violet-800">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
			Stay Connected
		</h2>
		<p class="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
			Get notified when I publish new content. No spam, just thoughtful insights delivered to your inbox.
		</p>
		<form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
			<input 
				type="email" 
				placeholder="Enter your email"
				class="input-field flex-1"
				required
			/>
			<button type="submit" class="btn-primary">
				Subscribe
			</button>
		</form>
	</section>
</div>
