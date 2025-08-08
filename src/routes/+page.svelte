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

<div class="relative">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-indigo-50/50 to-cyan-50/80 dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-cyan-950/20 pointer-events-none"></div>
	
	<div class="container mx-auto px-4 py-16 md:py-24 relative">
		<!-- Hero Section -->
		<section class="text-center mb-20">
			<div class="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium mb-8 animate-fade-in">
				<div class="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
				Available for collaboration
			</div>
			
			<h1 class="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
				<span class="bg-gradient-to-br from-gray-900 via-violet-800 to-indigo-900 dark:from-white dark:via-violet-200 dark:to-indigo-200 bg-clip-text text-transparent">
					Gökhan Turhan
				</span>
			</h1>
			
			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto animate-slide-up font-light">
				T-shaped generalist solopreneur exploring the intersection of 
				<span class="text-violet-600 dark:text-violet-400 font-medium">fintech</span>, 
				<span class="text-indigo-600 dark:text-indigo-400 font-medium">deep tech</span>, and 
				<span class="text-cyan-600 dark:text-cyan-400 font-medium">investment strategy</span>
			</p>
			
			<div class="max-w-3xl mx-auto space-y-4 text-gray-600 dark:text-gray-300 mb-12 animate-slide-up">
				<p class="leading-relaxed">
					My research focuses on <strong>stablecoins</strong>, <strong>RWAs</strong>, <strong>tokenization</strong>, <strong>cryptography</strong>, <strong>AGI timelines</strong>, and global systemic challenges — converging at the junction of real assets, information markets, and the emergent art of investment.
				</p>
			</div>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
				<a 
					href="/blog" 
					class="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
					</svg>
					Read My Research
					<svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</a>
				<a 
					href="/links" 
					class="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
					</svg>
					Links & Resources
				</a>
			</div>
		</section>
	
		<!-- Research Areas -->
		<section class="mb-20">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Research Focus</h2>
				<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Exploring emergent technologies and their systemic implications
				</p>
			</div>
			
			<div class="grid md:grid-cols-3 gap-8">
				<div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-violet-950/30 dark:to-indigo-950/30 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-violet-100 dark:border-violet-900/30">
					<div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="relative">
						<div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
							</svg>
						</div>
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Stablecoins & RWAs</h3>
						<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
							Tokenization mechanisms, regulatory frameworks, and the intersection of digital and physical assets in emerging financial systems.
						</p>
					</div>
				</div>
				
				<div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-emerald-100 dark:border-emerald-900/30">
					<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="relative">
						<div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
							</svg>
						</div>
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">AGI & Deep Tech</h3>
						<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
							Timeline analysis, competitive governance implications, and the technological pathways toward artificial general intelligence.
						</p>
					</div>
				</div>
				
				<div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/30 dark:to-blue-950/30 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-cyan-100 dark:border-cyan-900/30">
					<div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="relative">
						<div class="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
							</svg>
						</div>
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Investment Strategy</h3>
						<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
							Information markets, sabermetrics applications, and systematic approaches to capital allocation in emerging technologies.
						</p>
					</div>
				</div>
			</div>
		</section>
	
		<!-- Recent Posts Section -->
		<section class="mb-20">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest Research</h2>
				<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Recent explorations in fintech, stablecoins, and emerging technologies
				</p>
			</div>
			
			<div class="grid lg:grid-cols-2 gap-8">
				<!-- Featured Post -->
				<article class="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300">
					<div class="p-8 md:p-12">
						<div class="flex items-center gap-3 mb-6">
							<span class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium rounded-full">
								<span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
								Featured Research
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">Finance & Markets</span>
						</div>
						
						<h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
							<a href="/blog/non-pegged-stablecoins-01-on-the-current-state-of-hai" class="before:absolute before:inset-0">
								Non-pegged Stablecoins #01: On the Current State of HAI
							</a>
						</h3>
						
						<p class="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
							An in-depth analysis of HAI, a non-pegged stablecoin framework built on RAI's foundation. Exploring managed float regimes, PI controllers, and decentralized monetary systems that transcend traditional fiat pegs.
						</p>
						
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
								<time class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
									</svg>
									July 20, 2024
								</time>
								<span class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
									12 min read
								</span>
							</div>
							<div class="flex gap-2">
								<span class="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-md">stablecoins</span>
								<span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-md">HAI</span>
								<span class="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded-md">DeFi</span>
							</div>
						</div>
					</div>
				</article>
				
				<!-- Recent Posts -->
				<article class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg transition-all duration-300">
					<div class="p-6">
						<div class="flex items-center gap-2 mb-4">
							<span class="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-md">Finance & Markets</span>
						</div>
						
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
							<a href="/blog/11-theses-for-crypto-in-2024" class="before:absolute before:inset-0">
								11 Theses for Crypto in 2024
							</a>
						</h3>
						
						<p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm">
							Exploring 11 key theses about crypto infrastructure, intent-based architectures, and the evolution of DeFi markets in 2024.
						</p>
						
						<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
							<time>Dec 24, 2023</time>
							<span>12 min read</span>
						</div>
					</div>
				</article>
				
				<article class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg transition-all duration-300">
					<div class="p-6">
						<div class="flex items-center gap-2 mb-4">
							<span class="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-md">Technology</span>
						</div>
						
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
							<a href="/blog/on-consumer-crypto-01" class="before:absolute before:inset-0">
								On Consumer Crypto #01
							</a>
						</h3>
						
						<p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm">
							Examining the consumer-facing applications of cryptocurrency and blockchain technology in everyday life.
						</p>
						
						<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
							<time>Coming Soon</time>
							<span>8 min read</span>
						</div>
					</div>
				</article>
			</div>
			
			<div class="text-center mt-12">
				<a 
					href="/blog" 
					class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-900/30 dark:hover:to-indigo-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 border border-gray-200 dark:border-gray-600"
				>
					View All Research
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
					</svg>
				</a>
			</div>
		</section>
	
		<!-- Connect Section -->
		<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 p-12 border border-violet-100 dark:border-violet-900/30">
			<div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
			<div class="relative text-center">
				<div class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium mb-6">
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					Open to collaboration
				</div>
				
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
					Let's Build the Future Together
				</h2>
				
				<p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
					Interested in stablecoins, RWAs, investment strategies, or emerging technologies? Let's connect and explore what's possible.
				</p>
				
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a 
						href="mailto:gokhan@gokhanturhan.com" 
						class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
						</svg>
						Get in Touch
					</a>
					<a 
						href="https://twitter.com/0xgokhan" 
						target="_blank" 
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border border-white/20 dark:border-gray-700/50 rounded-xl font-medium hover:bg-white/90 dark:hover:bg-gray-700/80 transition-all duration-200"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
						Follow on X
					</a>
				</div>
			</div>
		</section>
	</div>
</div>
