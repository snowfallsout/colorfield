<!--
  ControlServer.svelte
  Doc: Server-side control group for session naming, directory routing, and operator token replacement.
-->

<script lang="ts">
	import ControlSection from './Control.svelte';
	import ControlTextField from './ControlTextField.svelte';
	import type { ControlTextFieldConfig } from '$lib/settings/control';
	import type { ControlServerProfile } from '$lib/types/control';

	type ControlServerSectionProps = {
		server: ControlServerProfile;
		serverTextFields: ControlTextFieldConfig<ControlServerProfile>[];
		operatorTokenPlaceholder: string;
		replaceOperatorToken: string;
	};

	let {
		server,
		serverTextFields,
		operatorTokenPlaceholder,
		replaceOperatorToken = $bindable('')
	}: ControlServerSectionProps = $props();
</script>

<ControlSection tag="Server" title="Server 側設定">
	<div class="field-grid">
		{#each serverTextFields as field (field.key)}
			<ControlTextField label={field.label} bind:value={server[field.key]} />
		{/each}
		<ControlTextField
			label="Replace Operator Token"
			type="password"
			placeholder={operatorTokenPlaceholder}
			bind:value={replaceOperatorToken}
		/>
	</div>

	<p class="helper">`sessionsDir`、`sessionFilePrefix` 等 server owner 參數會先保存到 profile；部分既有記憶體快取或檔案句柄可能要到下一次 request 或重啟後完全反映。</p>
</ControlSection>

<style>
	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.helper {
		margin: 16px 0 0;
		font-size: 12px;
		line-height: 1.7;
		color: rgba(31, 41, 55, 0.52);
	}

	@media (max-width: 760px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>