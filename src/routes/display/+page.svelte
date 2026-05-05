<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '../../lib/components/display/Header.svelte';
	import Canvas from '../../lib/components/display/Canvas.svelte';
	import Legend from '../../lib/components/display/Legend.svelte';
	import SessionPanel from '../../lib/components/display/SessionPanel.svelte';
	import { displayState } from '../../lib/state/display.svelte';
	import { loadSessionOverview, regenerateJoinQr, restoreSavedIp } from '../../lib/services/display/session';
	import Toast from '../../lib/components/display/Toast.svelte';
	import EmotionBadge from '../../lib/components/display/EmotionBadge.svelte';
	import SmileEmoji from '../../lib/components/display/SmileEmoji.svelte';
	import HandBadge from '../../lib/components/display/HandBadge.svelte';
	import CamToggle from '../../lib/components/display/CamToggle.svelte';
	import Footer from '../../lib/components/display/Footer.svelte';

	onMount(() => {
		restoreSavedIp();
		void regenerateJoinQr();
		void loadSessionOverview();
	});
</script>

<Header />
<Canvas />

<!-- UI overlays -->
<Legend />
{#if $displayState.sessionPanel.open}
	<SessionPanel />
{/if}
<EmotionBadge />
<SmileEmoji />
<HandBadge />
<CamToggle />
<Toast />
<Footer />

<style>
	:global(body) { margin: 0; }
</style>
