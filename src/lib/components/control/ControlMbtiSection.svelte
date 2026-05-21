<!--
  ControlMbti.svelte
  Doc: MBTI palette editor that keeps the repeated palette cards out of the route-level layout.
-->

<script lang="ts">
	import { MBTI_NAMES, MBTI_ORDER, type MBTIKey, type Palette } from '$lib/shared/constants/mbti';
	import type { ControlPaletteFieldConfig } from '$lib/settings/control';
	import ControlColorField from './ControlColorField.svelte';
	import ControlSection from './Control.svelte';

	type ControlMbtiSectionProps = {
		palettes: Record<MBTIKey, Palette>;
		paletteFields: ControlPaletteFieldConfig[];
	};

	let { palettes, paletteFields }: ControlMbtiSectionProps = $props();
</script>

<ControlSection tag="MBTI" title="MBTI 顏色與 Palette" className="palette-card-grid">
	<div class="palette-grid">
		{#each MBTI_ORDER as mbti (mbti)}
			{@const palette = palettes[mbti]}
			<article class="palette-entry">
				<div class="palette-head">
					<strong>{mbti}</strong>
					<span>{MBTI_NAMES[mbti]}</span>
				</div>

				{#each paletteFields as field (field.key)}
					<ControlColorField label={field.label} bind:value={palette[field.key]} />
				{/each}
			</article>
		{/each}
	</div>
</ControlSection>

<style>
	.palette-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 14px;
	}

	.palette-entry {
		padding: 16px;
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(31, 41, 55, 0.08);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.palette-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
	}

	.palette-head strong {
		font-size: 18px;
		letter-spacing: -0.04em;
	}

	.palette-head span {
		font-size: 12px;
		color: rgba(31, 41, 55, 0.48);
	}

	@media (max-width: 1120px) {
		.palette-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.palette-grid {
			grid-template-columns: 1fr;
		}
	}
</style>