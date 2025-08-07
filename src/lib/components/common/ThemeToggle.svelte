<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import Button from '$lib/components/ui/button.svelte';
	import { Sun, Moon } from 'lucide-svelte';

	let currentTheme = $state('light');
	
	// Subscribe to theme changes
	$effect(() => {
		const unsubscribe = theme.subscribe(value => {
			currentTheme = value;
		});
		return unsubscribe;
	});

	function toggleTheme() {
		theme.toggle();
	}
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleTheme}
	class="relative h-9 w-9"
	aria-label="Toggle theme"
>
	<Sun
		class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
