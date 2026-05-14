<!--
  ControlNumberField.svelte
  Doc: Reusable numeric field for the control panel, keeping repeated label/input markup out of the page shell.
-->

<script lang="ts">
	import { controlComponentDefaults } from '$lib/settings/control';

	let {
		label,
		value = $bindable(controlComponentDefaults.numberValue),
		min,
		max,
		step
	}: {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
	} = $props();
</script>

<label class="field">
	<span>{label}</span>
	<input type="number" {min} {max} {step} bind:value>
</label>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 13px;
		letter-spacing: 0.04em;
		color: rgba(31, 41, 55, 0.72);
	}

	input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid rgba(31, 41, 55, 0.12);
		border-radius: 14px;
		padding: 12px 14px;
		font: inherit;
		color: #111827;
		background: rgba(255, 255, 255, 0.94);
	}
</style>