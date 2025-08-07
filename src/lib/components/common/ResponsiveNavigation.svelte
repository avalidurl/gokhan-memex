<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import Button from '$lib/components/ui/button.svelte';
	import { onMount } from 'svelte';
	
	let mobileMenuOpen = $state(false);
	let mounted = $state(false);

	const navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Blog', href: '/blog' },
		{ name: 'Links', href: '/links' },
		{ name: 'Lists', href: '/lists' },
		{ name: 'Archive', href: '/archive' }
	];

	onMount(() => {
		theme.init();
		mounted = true;
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleThemeToggle() {
		theme.toggle();
	}

	// Close mobile menu when clicking outside
	function handleOutsideClick(event: MouseEvent) {
		if (mobileMenuOpen) {
			const nav = document.getElementById('mobile-menu');
			if (nav && !nav.contains(event.target as Node)) {
				closeMobileMenu();
			}
		}
	}

	onMount(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => document.removeEventListener('click', handleOutsideClick);
	});
</script>

<header class="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
	<nav class="container mx-auto px-4">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a 
					href="/" 
					class="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
				>
					<svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="32" height="32" rx="6" fill="currentColor" class="text-violet-600"/>
						<path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
						<circle cx="24" cy="8" r="3" fill="currentColor" class="text-green-500"/>
					</svg>
					<span class="hidden sm:block">Gökhan Memex</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				{#each navigation as item}
					<a 
						href={item.href}
						class="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors relative group"
						class:active={$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/')}
					>
						{item.name}
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 dark:bg-violet-400 transition-all group-hover:w-full"></span>
					</a>
				{/each}
			</div>

			<!-- Desktop Actions -->
			<div class="hidden md:flex items-center space-x-4">
				<!-- Search Button -->
				<Button variant="ghost" size="sm">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
					<span class="sr-only">Search</span>
				</Button>

				<!-- Theme Toggle -->
				<Button 
					variant="ghost" 
					size="sm"
					onclick={handleThemeToggle}
					aria-label="Toggle theme"
				>
					{#if mounted}
						{#if $theme === 'light'}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
							</svg>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
							</svg>
						{/if}
					{:else}
						<div class="w-4 h-4"></div>
					{/if}
				</Button>
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden flex items-center space-x-2">
				<!-- Mobile Theme Toggle -->
				<Button 
					variant="ghost" 
					size="sm"
					onclick={handleThemeToggle}
					aria-label="Toggle theme"
				>
					{#if mounted}
						{#if $theme === 'light'}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
							</svg>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
							</svg>
						{/if}
					{:else}
						<div class="w-4 h-4"></div>
					{/if}
				</Button>

				<!-- Hamburger -->
				<Button
					variant="ghost" 
					size="sm"
					onclick={toggleMobileMenu}
					aria-label="Toggle navigation menu"
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					{:else}
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
						</svg>
					{/if}
				</Button>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div id="mobile-menu" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
				<div class="px-2 pt-2 pb-3 space-y-1">
					{#each navigation as item}
						<a 
							href={item.href}
							onclick={closeMobileMenu}
							class="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
							class:active={$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/')}
						>
							{item.name}
						</a>
					{/each}
					
					<!-- Mobile Search -->
					<button 
						class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
						onclick={closeMobileMenu}
					>
						<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
						Search
					</button>
				</div>
			</div>
		{/if}
	</nav>
</header>

<style>
	.active {
		@apply text-violet-600 dark:text-violet-400;
	}
	
	.active span {
		@apply w-full;
	}
</style>
