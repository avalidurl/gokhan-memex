<script lang="ts">
	import { onMount } from 'svelte';
	import '../styles/app.css';
	import ResponsiveNavigation from '$lib/components/common/ResponsiveNavigation.svelte';
	import { theme } from '$lib/stores/theme';
	
	// Props from page data
	interface Props {
		children: any;
	}
	
	let { children }: Props = $props();
	
	// Initialize theme on mount
	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<title>Gökhan Turhan - Research & Insights on Fintech, Deep Tech & Investment Strategy</title>
	<meta name="description" content="T-shaped generalist solopreneur, researcher, and conceptual artist. Research on stablecoins, RWAs, tokenization, cryptography, AGI timelines, and investment strategies." />
	<meta name="author" content="Gökhan Turhan" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://gokhanturhan.com" />
	<meta property="og:title" content="Gökhan Turhan - Research & Insights on Fintech, Deep Tech & Investment Strategy" />
	<meta property="og:description" content="T-shaped generalist solopreneur, researcher, and conceptual artist. Research on stablecoins, RWAs, tokenization, cryptography, AGI timelines, and investment strategies." />
	<meta property="og:site_name" content="Gökhan Turhan" />
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://gokhanturhan.com" />
	<meta property="twitter:title" content="Gökhan Turhan - Research & Insights on Fintech, Deep Tech & Investment Strategy" />
	<meta property="twitter:description" content="T-shaped generalist solopreneur, researcher, and conceptual artist. Research on stablecoins, RWAs, tokenization, cryptography, AGI timelines, and investment strategies." />
	<meta property="twitter:creator" content="@0xgokhan" />
	
	<!-- Theme color for mobile browsers -->
	<meta name="theme-color" content="#ffffff" />
	
	<!-- Structured data -->
	<script type="application/ld+json">
	{JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Gökhan Turhan',
		alternateName: '0xgokhan',
		description: 'T-shaped generalist solopreneur, researcher, and conceptual artist operating across fintech, deep tech, competitive governance, art markets, and investment strategies. Research focuses on stablecoins, RWAs, tokenization, cryptography, AGI timelines, and global systemic challenges. Main areas of interest converge upon the junction of stablecoins, real assets, tokenization, information markets, sabermetrics, and the ever-emergent art of investment. Enjoys heavy training, running, cooking, sound art, cars, and history. Believes in deep tech causes that will unconditionally accelerate our species toward a Kardashev-scale immediate future.',
		jobTitle: ['Solopreneur', 'Researcher', 'Conceptual Artist'],
		url: 'https://gokhanturhan.com',
		knowsAbout: [
			'Stablecoins', 'Real World Assets', 'RWA', 'Tokenization', 'Cryptography', 
			'Artificial General Intelligence', 'AGI timelines', 'Investment Strategy', 
			'Fintech', 'Deep Tech', 'Art Markets', 'Information Markets', 'Sabermetrics',
			'Competitive Governance', 'Global Systemic Challenges', 'Kardashev Scale'
		],
		hasOccupation: {
			'@type': 'Occupation',
			name: 'Independent Researcher',
			description: 'Research on stablecoins, tokenization, investment strategies, and emerging technologies',
			skills: ['Financial Research', 'Technology Analysis', 'Investment Strategy', 'Conceptual Art', 'Cryptography Analysis']
		},
		worksFor: {
			'@type': 'Organization',
			name: 'Independent Research'
		},
		mainEntityOfPage: {
			'@type': 'WebSite',
			name: 'Gökhan Turhan Digital Garden',
			description: 'Research journal and memex covering fintech, deep tech, investment strategies, and systemic analysis',
			url: 'https://gokhanturhan.com'
		},
		sameAs: [
			'https://twitter.com/0xgokhan',
			'https://github.com/avalidurl', 
			'https://linkedin.com/in/goekhanturhan'
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
