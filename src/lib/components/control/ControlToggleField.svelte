<!--
  ControlToggleField.svelte
  Doc: Reusable checkbox row for boolean control-profile flags.
-->

<script lang="ts">
	import { controlComponentDefaults } from '$lib/settings/control';

	let {
		label,
		checked = $bindable(controlComponentDefaults.toggleChecked)
	}: {
		label: string;
		checked: boolean;
	} = $props();
</script>

<label class="toggle-row">
	<span>{label}</span>
	<input type="checkbox" bind:checked>
</label>

<style>
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		margin-bottom: 16px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.64);
		font-size: 13px;
		letter-spacing: 0.04em;
		color: rgba(31, 41, 55, 0.72);
	}

	input {
		width: 18px;
		height: 18px;
	}
</style>