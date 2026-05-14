<!--
  ControlPanel.svelte
  Doc: Main control-route UI that renders the full panel and forwards load/save triggers into the control state owner.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { MBTI_NAMES, MBTI_ORDER } from '$lib/shared/constants/mbti';
	import { controlSettings } from '$lib/settings/control';
	import {
		controlState,
		loadControlPanel,
		saveControlPanel,
		setControlHandsModelComplexity,
		setControlResolution
	} from '$lib/states/control.svelte';
	import ControlColorField from './ControlColorField.svelte';
	import ControlNumberField from './ControlNumberField.svelte';
	import ControlSection from './ControlSection.svelte';
	import ControlTextField from './ControlTextField.svelte';
	import ControlToggleField from './ControlToggleField.svelte';

	const {
		cameraConfidenceFields,
		cameraFields,
		displayFields,
		handsComplexityOptions,
		networkNumberFields,
		networkTextFields,
		paletteFields,
		placeholders,
		resolutionPresets,
		serverTextFields
	} = controlSettings;

	onMount(() => {
		void loadControlPanel();
	});
</script>

<svelte:head>
	<title>Control Panel</title>
</svelte:head>

<main class="control-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Top-Level Control</p>
			<h1>Control Panel</h1>
			<p class="lead">用最少的界面，直接控制 display、mobile 與共用 runtime 的核心參數。</p>
		</div>
		<div class="hero-actions">
			<button class="ghost" type="button" onclick={() => void loadControlPanel(true)} disabled={controlState.loading || controlState.saving}>
				{controlState.loading ? '载入中…' : '重新读取'}
			</button>
			<button class="primary" type="button" onclick={() => void saveControlPanel()} disabled={controlState.loading || controlState.saving}>
				{controlState.saving ? '保存中…' : '保存控制設定'}
			</button>
		</div>
	</section>

	{#if controlState.error}
		<p class="banner error">{controlState.error}</p>
	{:else if controlState.status}
		<p class="banner ok">{controlState.status}</p>
	{/if}

	<div class="panel-grid">
		<ControlSection tag="Camera" title="鏡頭與感知">
			<ControlToggleField label="預設啟用鏡頭" bind:checked={controlState.profile.camera.enabled} />

			<div class="preset-row">
				{#each resolutionPresets as preset (preset.label)}
					<button
						type="button"
						class:active={controlState.profile.camera.width === preset.width && controlState.profile.camera.height === preset.height}
						onclick={() => setControlResolution(preset.width, preset.height)}
					>
						{preset.label}
					</button>
				{/each}
			</div>

			<div class="field-grid two">
				{#each cameraFields as field (field.key)}
					<ControlNumberField
						label={field.label}
						min={field.min}
						max={field.max}
						step={field.step}
						bind:value={controlState.profile.camera[field.key]}
					/>
				{/each}
			</div>

			<div class="field-grid two compact">
				{#each cameraConfidenceFields as field (field.key)}
					<ControlNumberField
						label={field.label}
						min={field.min}
						max={field.max}
						step={field.step}
						bind:value={controlState.profile.camera[field.key]}
					/>
				{/each}
			</div>

			<div class="segmented">
				{#each handsComplexityOptions as option (option.value)}
					<button
						type="button"
						class:active={controlState.profile.camera.handsModelComplexity === option.value}
						onclick={() => setControlHandsModelComplexity(option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</ControlSection>

		<ControlSection tag="Display" title="水幕與粒子">
			<ControlToggleField label="預設開啟水幕" bind:checked={controlState.profile.display.waterOverlay} />

			<div class="field-grid two">
				{#each displayFields as field (field.key)}
					<ControlNumberField
						label={field.label}
						min={field.min}
						max={field.max}
						step={field.step}
						bind:value={controlState.profile.display[field.key]}
					/>
				{/each}
			</div>

			<ControlColorField label="Canvas Clear Color" bind:value={controlState.profile.display.clearColor} />
		</ControlSection>

		<ControlSection tag="Config" title="Transport 與共用設定">
			<div class="field-grid">
				{#each networkTextFields as field (field.key)}
					<ControlTextField
						label={field.label}
						placeholder={field.placeholder}
						bind:value={controlState.profile.network[field.key]}
					/>
				{/each}
				{#each networkNumberFields as field (field.key)}
					<ControlNumberField
						label={field.label}
						min={field.min}
						max={field.max}
						step={field.step}
						bind:value={controlState.profile.network[field.key]}
					/>
				{/each}
			</div>
		</ControlSection>

		<ControlSection tag="Server" title="Server 側設定">
			<div class="field-grid">
				{#each serverTextFields as field (field.key)}
					<ControlTextField label={field.label} bind:value={controlState.profile.server[field.key]} />
				{/each}
				<ControlTextField
					label="Replace Operator Token"
					type="password"
					placeholder={controlState.profile.server.operatorTokenDefined ? placeholders.operatorTokenConfigured : placeholders.operatorTokenMissing}
					bind:value={controlState.replaceOperatorToken}
				/>
			</div>

			<p class="helper">`sessionsDir`、`sessionFilePrefix` 等 server owner 參數會先保存到 profile；部分既有記憶體快取或檔案句柄可能要到下一次 request 或重啟後完全反映。</p>
		</ControlSection>
	</div>

	<ControlSection tag="MBTI" title="MBTI 顏色與 Palette" className="palette-card-grid">
		<div class="palette-grid">
			{#each MBTI_ORDER as mbti (mbti)}
				{@const palette = controlState.profile.mbti.palettes[mbti]}
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
</main>

<style>
	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top left, rgba(255, 226, 200, 0.9), transparent 30%),
			radial-gradient(circle at top right, rgba(202, 227, 255, 0.75), transparent 28%),
			linear-gradient(180deg, #fffdf8 0%, #f6f2ea 100%);
	}

	.control-shell {
		max-width: 1320px;
		margin: 0 auto;
		padding: 36px 20px 56px;
		color: #1f2937;
		font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
	}

	.hero {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		align-items: flex-end;
		margin-bottom: 20px;
	}

	.hero-copy h1 {
		margin: 0;
		font-size: clamp(36px, 7vw, 74px);
		line-height: 0.95;
		letter-spacing: -0.06em;
		font-weight: 500;
	}

	.eyebrow {
		margin: 0 0 10px;
		font-size: 11px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: rgba(31, 41, 55, 0.46);
	}

	.lead {
		max-width: 44ch;
		margin: 12px 0 0;
		font-size: 15px;
		line-height: 1.8;
		color: rgba(31, 41, 55, 0.72);
	}

	.hero-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	button {
		appearance: none;
		border: 1px solid rgba(31, 41, 55, 0.12);
		background: rgba(255, 255, 255, 0.85);
		border-radius: 999px;
		padding: 12px 18px;
		font: inherit;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
	}

	button:hover {
		transform: translateY(-1px);
		border-color: rgba(31, 41, 55, 0.28);
	}

	button:disabled {
		cursor: progress;
		opacity: 0.65;
		transform: none;
	}

	button.primary {
		background: #1f2937;
		color: #fffdf8;
	}

	button.ghost,
	.preset-row button,
	.segmented button {
		background: rgba(255, 255, 255, 0.76);
	}

	button.active {
		border-color: rgba(31, 41, 55, 0.44);
		background: rgba(31, 41, 55, 0.1);
	}

	.banner {
		margin: 0 0 20px;
		padding: 14px 16px;
		border-radius: 18px;
		font-size: 14px;
		line-height: 1.6;
	}

	.banner.ok {
		background: rgba(191, 219, 254, 0.32);
		color: #1d4ed8;
	}

	.banner.error {
		background: rgba(254, 202, 202, 0.34);
		color: #b91c1c;
	}

	.panel-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.field-grid.compact {
		margin-top: 16px;
	}

	.preset-row,
	.segmented {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 18px;
	}

	.helper {
		margin: 16px 0 0;
		font-size: 12px;
		line-height: 1.7;
		color: rgba(31, 41, 55, 0.52);
	}

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
		.panel-grid,
		.palette-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.control-shell {
			padding: 24px 14px 40px;
		}

		.hero {
			flex-direction: column;
			align-items: stretch;
		}

		.panel-grid,
		.field-grid,
		.palette-grid {
			grid-template-columns: 1fr;
		}

		.hero-actions,
		.preset-row,
		.segmented {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>