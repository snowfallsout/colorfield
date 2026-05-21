<!--
  ControlSection.svelte
	Doc: Shared card shell for the control page section components so the repeated card chrome appears once.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	type ControlSectionProps = {
		tag: string;
		title: string;
		className?: string;
		children?: Snippet;
	};

	let { tag, title, className = '', children }: ControlSectionProps = $props();
</script>

<section class={`panel-card ${className}`.trim()}>
	<header>
		<p class="section-tag">{tag}</p>
		<h2>{title}</h2>
	</header>

	{@render children?.()}
</section>

<style>
	.panel-card {
		background: rgba(255, 255, 255, 0.76);
		border: 1px solid rgba(255, 255, 255, 0.72);
		border-radius: 28px;
		padding: 24px;
		box-shadow: 0 24px 48px rgba(148, 163, 184, 0.12);
		backdrop-filter: blur(18px);
	}

	.panel-card header h2 {
		margin: 0 0 18px;
		font-size: 24px;
		font-weight: 500;
		letter-spacing: -0.04em;
	}

	.section-tag {
		margin: 0 0 10px;
		font-size: 11px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: rgba(31, 41, 55, 0.46);
	}

	.palette-card-grid {
		margin-top: 18px;
	}
</style>