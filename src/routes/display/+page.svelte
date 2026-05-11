<!--
  src/routes/display/+page.svelte
  Doc: Display route shell that mounts the display UI and seeds saved session host data on load.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '../../lib/components/display/Header.svelte';
	import Canvas from '../../lib/components/display/Canvas.svelte';
	import Legend from '../../lib/components/display/Legend.svelte';
	import SessionPanel from '../../lib/components/display/SessionPanel.svelte';
	import { displayState, setSessionHostInput } from '../../lib/states/display.svelte';
	import { loadSessionOverview, readSavedDisplayHost, regenerateJoinQr } from '../../lib/services/session';
	import Toast from '../../lib/components/display/Toast.svelte';
	import EmotionBadge from '../../lib/components/display/EmotionBadge.svelte';
	import SmileEmoji from '../../lib/components/display/SmileEmoji.svelte';
	import HandBadge from '../../lib/components/display/HandBadge.svelte';
	import CamToggle from '../../lib/components/display/CamToggle.svelte';
	import Footer from '../../lib/components/display/Footer.svelte';
	import { hydrateControlProfile } from '$lib/services/control';
	import { getControlRuntimeDefaults } from '$lib/services/control.shared';
	import { initCamera } from '$lib/states/media.svelte';
	import { setWaterOverlay } from '$lib/states/ui.svelte';

	onMount(() => {
		let disposed = false;

		void (async () => {
			await hydrateControlProfile();
			if (disposed) {
				return;
			}

			const defaults = getControlRuntimeDefaults();
			setWaterOverlay(defaults.waterOverlay);

			const savedHost = readSavedDisplayHost();
			if (savedHost) {
				setSessionHostInput(savedHost);
			}
			await regenerateJoinQr();
			await loadSessionOverview();

			if (defaults.cameraEnabled) {
				await initCamera().catch(() => {});
			}
		})();

		return () => {
			disposed = true;
		};
	});
</script>

<Header />
<Canvas />

<!-- UI overlays -->
<Legend />
{#if displayState.sessionPanel.open}
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
