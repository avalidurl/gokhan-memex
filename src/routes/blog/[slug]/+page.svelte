<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, formatReadingTime } from '$lib/utils/date';
	import { generateMetaTags, generateStructuredData } from '$lib/utils/seo';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import Separator from '$lib/components/ui/separator.svelte';
	import { onMount } from 'svelte';
	
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	let readingProgress = $state(0);
	let activeSection = $state('');
	let tocElement: HTMLElement | null = $state(null);

	// Generate meta tags and structured data
	const metaTags = generateMetaTags(data.meta);
	const structuredData = generateStructuredData({
		...data.meta,
		url: `https://gokhanturhan.com/blog/${data.post.slug}`,
		wordCount: data.post.wordCount,
		readingTime: data.post.readingTime
	});

	onMount(() => {
		// Reading progress tracking
		function updateReadingProgress() {
			const article = document.querySelector('article');
			if (!article) return;

			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const progress = (scrollTop / docHeight) * 100;
			readingProgress = Math.min(100, Math.max(0, progress));
		}

		// Table of contents active section tracking
		function updateActiveSection() {
			const headings = document.querySelectorAll('article h2, article h3, article h4, article h5, article h6');
			let current = '';

			for (let i = headings.length - 1; i >= 0; i--) {
				const heading = headings[i] as HTMLElement;
				const rect = heading.getBoundingClientRect();
				
				if (rect.top <= 100) {
					current = heading.id;
					break;
				}
			}

			activeSection = current;
		}

		// Event listeners
		function handleScroll() {
			updateReadingProgress();
			updateActiveSection();
		}

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial call

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	const formattedDate = formatDate(data.post.publishedAt, { format: 'long' });
	const readingTimeText = formatReadingTime(data.post.readingTime);
</script>

<svelte:head>
	<title>{metaTags.title}</title>
	<meta name="description" content={metaTags.description} />
	<meta name="keywords" content={metaTags.keywords} />
	<meta name="author" content={metaTags.author} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={metaTags['og:title']} />
	<meta property="og:description" content={metaTags['og:description']} />
	<meta property="og:type" content={metaTags['og:type']} />
	<meta property="og:image" content={metaTags['og:image']} />
	
	<!-- Twitter -->
	<meta name="twitter:card" content={metaTags['twitter:card']} />
	<meta name="twitter:title" content={metaTags['twitter:title']} />
	<meta name="twitter:description" content={metaTags['twitter:description']} />
	<meta name="twitter:image" content={metaTags['twitter:image']} />
	
	<!-- Article specific -->
	{#if metaTags['article:published_time']}
		<meta property="article:published_time" content={metaTags['article:published_time']} />
	{/if}
	{#if metaTags['article:modified_time']}
		<meta property="article:modified_time" content={metaTags['article:modified_time']} />
	{/if}
	{#if metaTags['article:section']}
		<meta property="article:section" content={metaTags['article:section']} />
	{/if}
	
	<!-- Structured Data -->
	<script type="application/ld+json">
		{JSON.stringify(structuredData)}
	</script>
</svelte:head>

<!-- Reading Progress Bar -->
<div class="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
	<div 
		class="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-150"
		style="width: {readingProgress}%"
	></div>
</div>

<div class="container mx-auto px-4 py-8">
	<!-- Breadcrumbs -->
	<nav class="mb-8" aria-label="Breadcrumb">
		<ol class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
			{#each data.breadcrumbs as crumb, index}
				{#if index < data.breadcrumbs.length - 1}
					<li>
						<a href={crumb.href} class="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
							{crumb.label}
						</a>
					</li>
					<li>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
						</svg>
					</li>
				{:else}
					<li class="text-gray-900 dark:text-white font-medium">{crumb.label}</li>
				{/if}
			{/each}
		</ol>
	</nav>

	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Main Content -->
		<main class="flex-1 max-w-4xl">
			<article class="prose prose-lg dark:prose-invert max-w-none">
				<!-- Header -->
				<header class="not-prose mb-8">
					<!-- Category badges -->
					{#if data.post.categories && data.post.categories.length > 0}
						<div class="mb-4">
							{#each data.post.categories as category}
								<a 
									href="/blog?category={encodeURIComponent(category)}"
									class="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
								>
									{category}
								</a>
							{/each}
						</div>
					{/if}

					<!-- Featured badge -->
					{#if data.post.featured}
						<div class="mb-4">
							<Badge variant="default" class="bg-gradient-to-r from-violet-500 to-purple-600">
								⭐ Featured
							</Badge>
						</div>
					{/if}

					<!-- Series info -->
					{#if data.post.series}
						<div class="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
							<div class="flex items-center space-x-2 text-violet-700 dark:text-violet-300">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
								</svg>
								<span class="font-medium">Part of series: {data.post.series}</span>
								{#if data.post.seriesOrder}
									<Badge variant="secondary">Part {data.post.seriesOrder}</Badge>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Title -->
					<h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
						{data.post.title}
					</h1>

					<!-- Meta information -->
					<div class="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-6">
						<div class="flex items-center space-x-2">
							<img 
								src="/images/avatar.jpg" 
								alt={data.post.author}
								class="w-8 h-8 rounded-full"
								onerror={(e) => e.target.src = '/favicon.svg'}
							/>
							<span class="font-medium">{data.post.author}</span>
						</div>
						
						<time datetime={data.post.publishedAt.toISOString()}>
							{formattedDate}
						</time>
						
						<span>{readingTimeText}</span>
						
						<span>{data.post.wordCount.toLocaleString()} words</span>
					</div>

					<!-- Hero image -->
					{#if data.post.image}
						<div class="mb-8 rounded-xl overflow-hidden">
							<img 
								src={data.post.image}
								alt={data.post.imageAlt || data.post.title}
								class="w-full h-auto"
								loading="eager"
							/>
						</div>
					{/if}

					<!-- Description -->
					<div class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
						{data.post.description}
					</div>

					<!-- Tags -->
					{#if data.post.tags && data.post.tags.length > 0}
						<div class="flex flex-wrap gap-2 mb-8">
							{#each data.post.tags as tag}
								<a 
									href="/blog?tag={encodeURIComponent(tag)}"
									class="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
								>
									#{tag}
								</a>
							{/each}
						</div>
					{/if}
				</header>

				<!-- Content -->
				<!-- Note: This is a placeholder for MDX content rendering -->
				<!-- In a real implementation, you would use mdsvex to render the content -->
				<div class="prose-content">
					{@html data.post.content}
				</div>
			</article>

			<!-- Post Actions -->
			<div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<span class="text-sm text-gray-600 dark:text-gray-400">Share this post:</span>
						
						<!-- Social sharing buttons -->
						<div class="flex space-x-2">
							<Button 
								variant="outline" 
								size="sm"
								href="https://twitter.com/intent/tweet?text={encodeURIComponent(data.post.title)}&url={encodeURIComponent(`https://gokhanturhan.com/blog/${data.post.slug}`)}"
								target="_blank"
								rel="noopener noreferrer"
							>
								Twitter
							</Button>
							
							<Button 
								variant="outline" 
								size="sm"
								href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(`https://gokhanturhan.com/blog/${data.post.slug}`)}"
								target="_blank"
								rel="noopener noreferrer"
							>
								LinkedIn
							</Button>
						</div>
					</div>

					<!-- Back to blog -->
					<Button variant="outline" href="/blog">
						← Back to blog
					</Button>
				</div>
			</div>
		</main>

		<!-- Sidebar -->
		<aside class="lg:w-80">
			<div class="sticky top-8 space-y-8">
				<!-- Table of Contents -->
				{#if data.toc && data.toc.length > 0}
					<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h3>
						<nav bind:this={tocElement}>
							<ul class="space-y-2 text-sm">
								{#each data.toc as item}
									<li class="pl-{(item.level - 2) * 4}">
										<button
											onclick={() => scrollToSection(item.id)}
											class="text-left w-full text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors {activeSection === item.id ? 'text-violet-600 dark:text-violet-400 font-medium' : ''}"
										>
											{item.text}
										</button>
									</li>
								{/each}
							</ul>
						</nav>
					</div>
				{/if}

				<Separator />

				<!-- Related Posts -->
				{#if data.relatedPosts && data.relatedPosts.length > 0}
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Posts</h3>
						<div class="space-y-4">
							{#each data.relatedPosts as relatedPost}
								<PostCard post={relatedPost} variant="compact" />
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</aside>
	</div>
</div>

<style>
	:global(.prose-content h2),
	:global(.prose-content h3),
	:global(.prose-content h4),
	:global(.prose-content h5),
	:global(.prose-content h6) {
		scroll-margin-top: 2rem;
	}
</style>
