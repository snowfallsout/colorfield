<!--
  ControlConfig.svelte
  Doc: Network and shared runtime configuration group for the control page.
-->

<script lang="ts">
	import ControlNumberField from './ControlNumberField.svelte';
	import ControlSection from './Control.svelte';
	import ControlTextField from './ControlTextField.svelte';
	import type { ControlNumberFieldConfig, ControlTextFieldConfig } from '$lib/settings/control';
	import type { ControlNetworkProfile } from '$lib/types/control';

	type ControlConfigSectionProps = {
		network: ControlNetworkProfile;
		networkNumberFields: ControlNumberFieldConfig<ControlNetworkProfile>[];
		networkTextFields: ControlTextFieldConfig<ControlNetworkProfile>[];
	};

	let { network, networkNumberFields, networkTextFields }: ControlConfigSectionProps = $props();
</script>

<ControlSection tag="Config" title="Transport 與共用設定">
	<div class="field-grid">
		{#each networkTextFields as field (field.key)}
			<ControlTextField
				label={field.label}
				placeholder={field.placeholder}
				bind:value={network[field.key]}
			/>
		{/each}
		{#each networkNumberFields as field (field.key)}
			<ControlNumberField
				label={field.label}
				min={field.min}
				max={field.max}
				step={field.step}
				bind:value={network[field.key]}
			/>
		{/each}
	</div>
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