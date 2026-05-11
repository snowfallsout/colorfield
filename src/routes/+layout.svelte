<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { hydrateControlProfile } from '$lib/services/control';
	import '$lib/styles/global.css';

	let { children } = $props();

	onMount(() => {
		void hydrateControlProfile().catch(() => {});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
