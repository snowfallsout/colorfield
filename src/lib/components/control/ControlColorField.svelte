<!--
  ControlColorField.svelte
  Doc: Reusable palette color control that keeps the paired color/text inputs consistent across the control panel.
-->

<script lang="ts">
	import { controlComponentDefaults } from '$lib/settings/control';

	let {
		label,
		value = $bindable(controlComponentDefaults.colorValue)
	}: {
		label: string;
		value: string;
	} = $props();
</script>

<label class="field">
	<span>{label}</span>
	<div class="color-row">
		<input type="color" bind:value>
		<input type="text" bind:value>
	</div>
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

	.color-row {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr);
		gap: 10px;
		align-items: center;
	}

	input[type='color'] {
		width: 48px;
		height: 42px;
		padding: 0;
		border: none;
		background: transparent;
	}

	input[type='text'] {
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