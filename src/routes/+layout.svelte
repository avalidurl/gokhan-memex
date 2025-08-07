<script lang="ts">
	import '../styles/app.css';
	import ResponsiveNavigation from '$lib/components/common/ResponsiveNavigation.svelte';
	
	// Props from page data
	interface Props {
		children: any;
	}
	
	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Gökhan Memex - Digital Garden</title>
	<meta name="description" content="Premium digital garden and memex for thoughtful content on finance, art, and technology." />
	<meta name="author" content="Gökhan Turhan" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://gokhanturhan.com" />
	<meta property="og:title" content="Gökhan Memex - Digital Garden" />
	<meta property="og:description" content="Premium digital garden and memex for thoughtful content on finance, art, and technology." />
	<meta property="og:site_name" content="Gökhan Memex" />
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://gokhanturhan.com" />
	<meta property="twitter:title" content="Gökhan Memex - Digital Garden" />
	<meta property="twitter:description" content="Premium digital garden and memex for thoughtful content on finance, art, and technology." />
	<meta property="twitter:creator" content="@avalidurl" />
	
	<!-- Theme color for mobile browsers -->
	<meta name="theme-color" content="#ffffff" />
	
	<!-- Structured data -->
	<script type="application/ld+json">
	{JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Website',
		name: 'Gökhan Memex',
		description: 'Premium digital garden and memex for thoughtful content on finance, art, and technology.',
		url: 'https://gokhanturhan.com',
		author: {
			'@type': 'Person',
			name: 'Gökhan Turhan',
			url: 'https://gokhanturhan.com'
		},
		sameAs: [
			'https://twitter.com/avalidurl',
			'https://github.com/avalidurl'
		]
	})}
	</script>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Skip to content link for accessibility -->
	<a 
		href="#main-content" 
		class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-violet-600 text-white rounded-lg"
	>
		Skip to main content
	</a>
	
	<!-- Navigation -->
	<ResponsiveNavigation />
	
	<!-- Main content area -->
	<main id="main-content" class="flex-1">
		{@render children()}
	</main>
	
	<!-- Footer -->
	<footer class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
		<div class="container mx-auto px-4 py-8">
			<div class="text-center text-gray-600 dark:text-gray-400">
				<p>&copy; 2024 Gökhan Turhan. All rights reserved.</p>
				<p class="mt-2 text-sm">
					Built with <a href="https://kit.svelte.dev" class="text-violet-600 dark:text-violet-400 hover:underline">SvelteKit</a> 
					and <a href="https://tailwindcss.com" class="text-violet-600 dark:text-violet-400 hover:underline">Tailwind CSS</a>
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Add any additional component-specific styles here */
	.container {
		max-width: 1200px;
	}
</style>
