<!--
  ControlDisplaySection.svelte
  Doc: Display control group for water overlay, particle tuning, and canvas color.
-->

<script lang="ts">
	import ControlColorField from './ControlColorField.svelte';
	import ControlNumberField from './ControlNumberField.svelte';
	import ControlSection from './ControlSection.svelte';
	import ControlToggleField from './ControlToggleField.svelte';
	import type { ControlNumberFieldConfig } from '$lib/settings/control';
	import type { ControlDisplayProfile } from '$lib/types/control';

	type ControlDisplaySectionProps = {
		display: ControlDisplayProfile;
		displayFields: ControlNumberFieldConfig<ControlDisplayProfile>[];
	};

	let { display, displayFields }: ControlDisplaySectionProps = $props();
</script>

<ControlSection tag="Display" title="水幕與粒子">
	<ControlToggleField label="預設開啟水幕" bind:checked={display.waterOverlay} />

	<div class="field-grid">
		{#each displayFields as field (field.key)}
			<ControlNumberField
				label={field.label}
				min={field.min}
				max={field.max}
				step={field.step}
				bind:value={display[field.key]}
			/>
		{/each}
	</div>

	<ControlColorField label="Canvas Clear Color" bind:value={display.clearColor} />
</ControlSection>

<style>
	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	@media (max-width: 760px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>