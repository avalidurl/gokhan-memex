<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { buttonVariants } from './button.ts';
	import type { Variant, Size } from './button.ts';
	import { cn } from '$lib/utils/cn.ts';

	type Props = {
		variant?: Variant;
		size?: Size;
		href?: string;
		class?: string;
		children: Snippet;
	} & (HTMLButtonAttributes | HTMLAnchorAttributes);

	let {
		variant = 'default',
		size = 'default',
		href,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

{#if href}
	<a
		{href}
		class={cn(buttonVariants({ variant, size, className }))}
		{...restProps}
	>
		{@render children()}
	</a>
{:else}
	<button
		class={cn(buttonVariants({ variant, size, className }))}
		{...restProps}
	>
		{@render children()}
	</button>
{/if}
