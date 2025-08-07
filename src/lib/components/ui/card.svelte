<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn.ts';

	type Props = {
		class?: string;
		children: Snippet;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div
	class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
	{...restProps}
>
	{@render children()}
</div>
