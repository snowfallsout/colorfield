<!--
	Header.svelte
	Doc: Top header for the display view. Intended to show session title and
	basic controls. Lightweight and read-only; consumes `sessionName` from stores.
	Notation:
		- Purely presentational; avoid heavy initialization here.
-->

<script lang="ts">
	import { sessionName } from '$lib/stores/session';
</script>

<header class="display-header">
	<div class="title">
		<h1>Colorfield</h1>
		<p>MBTI · Emotion · Particle Art</p>
	</div>
</header>

<style>
.display-header { position:fixed; top:0; left:0; right:0; padding:12px 16px; z-index:20; display:flex; align-items:center; }
.title h1 { margin:0; font-size:1.1rem }
.title p { margin:0; font-size:12px; color:#666 }
</style>
