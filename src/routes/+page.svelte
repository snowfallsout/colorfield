<!--
  src/routes/+page.svelte
  Doc: Minimal route hub for the top-level display, mobile, and control entries.
-->

<svelte:head>
	<title>InkLumina Routes</title>
</svelte:head>

<script lang="ts">
	const entries = [
		{ href: '/display', eyebrow: 'Live Display', title: 'Display', copy: '大螢幕實時互動與粒子畫面。' },
		{ href: '/mobile', eyebrow: 'Mobile Join', title: 'Mobile', copy: '手機端 MBTI 互動與加入流程。' },
		{ href: '/control', eyebrow: 'Control Panel', title: 'Control', copy: '控制 camera、runtime、config 與 MBTI palette。' }
	];
</script>

<main class="hub-shell">
	<section class="hub-hero">
		<p class="eyebrow">InkLumina</p>
		<h1>Routes</h1>
		<p class="copy">用最短的路徑進入 display、mobile 與新的 control panel。</p>
	</section>

	<section class="hub-grid">
		{#each entries as entry (entry.href)}
			<a class="hub-card" href={entry.href}>
				<p>{entry.eyebrow}</p>
				<h2>{entry.title}</h2>
				<span>{entry.copy}</span>
			</a>
		{/each}
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background: linear-gradient(180deg, #f9f6ef 0%, #eef3fb 100%);
		font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
	}

	.hub-shell {
		min-height: 100vh;
		padding: 28px;
		box-sizing: border-box;
		display: grid;
		align-content: center;
		gap: 28px;
	}

	.hub-hero {
		max-width: 560px;
	}

	.eyebrow,
	.hub-card p {
		margin: 0 0 10px;
		font-size: 11px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: rgba(31, 41, 55, 0.45);
	}

	.hub-hero h1 {
		margin: 0;
		font-size: clamp(44px, 8vw, 88px);
		line-height: 0.95;
		letter-spacing: -0.08em;
		font-weight: 500;
		color: #111827;
	}

	.copy {
		margin: 14px 0 0;
		font-size: 16px;
		line-height: 1.8;
		color: rgba(31, 41, 55, 0.72);
	}

	.hub-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}

	.hub-card {
		display: block;
		padding: 22px;
		border-radius: 28px;
		text-decoration: none;
		background: rgba(255, 255, 255, 0.78);
		border: 1px solid rgba(255, 255, 255, 0.74);
		box-shadow: 0 18px 42px rgba(148, 163, 184, 0.14);
		color: inherit;
		transition: transform 0.18s ease, box-shadow 0.18s ease;
	}

	.hub-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 24px 48px rgba(148, 163, 184, 0.18);
	}

	.hub-card h2 {
		margin: 0;
		font-size: 32px;
		font-weight: 500;
		letter-spacing: -0.05em;
	}

	.hub-card span {
		display: block;
		margin-top: 12px;
		font-size: 14px;
		line-height: 1.7;
		color: rgba(31, 41, 55, 0.68);
	}

	@media (max-width: 860px) {
		.hub-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
