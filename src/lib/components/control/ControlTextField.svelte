<!--
  ControlTextField.svelte
  Doc: Reusable text/password field for the control panel so string inputs share one labeled UI owner.
-->

<script lang="ts">
	import { controlComponentDefaults } from '$lib/settings/control';

	let {
		label,
		value = $bindable(controlComponentDefaults.textValue),
		placeholder = controlComponentDefaults.textPlaceholder,
		type = controlComponentDefaults.textType
	}: {
		label: string;
		value: string;
		placeholder?: string;
		type?: 'text' | 'password';
	} = $props();
</script>

<label class="field">
	<span>{label}</span>
	<input {type} {placeholder} bind:value>
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