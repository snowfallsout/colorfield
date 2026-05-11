<!--
  ControlPanelPage.svelte
  Doc: Minimal top-level control route for editing runtime, config, and MBTI palette overrides without nesting the feature under display.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { MBTI_NAMES, MBTI_ORDER } from '$lib/shared/constants/mbti';
	import {
		controlState,
		setControlError,
		setControlLoading,
		setControlProfile,
		setControlSaving,
		setControlStatus,
		setReplaceOperatorToken
	} from '$lib/states/control.svelte';
	import { hydrateControlProfile, saveControlProfile } from '$lib/services/control';

	const resolutionPresets = [
		{ label: '640 × 480', width: 640, height: 480 },
		{ label: '1080 × 720', width: 1080, height: 720 },
		{ label: '1660 × 900', width: 1660, height: 900 },
		{ label: '1920 × 1080', width: 1920, height: 1080 }
	];

	async function loadPanel(force = false): Promise<void> {
		setControlLoading(true);
		setControlError('');

		try {
			const profile = await hydrateControlProfile(force);
			setControlProfile(profile);
			if (force) {
				setControlStatus('已從目前 server profile 重新載入。');
			}
		} catch (error) {
			setControlError(error instanceof Error ? error.message : 'Failed to load control profile');
		} finally {
			setControlLoading(false);
		}
	}

	async function savePanel(): Promise<void> {
		setControlSaving(true);
		setControlError('');

		try {
			const profile = await saveControlProfile(controlState.profile, controlState.replaceOperatorToken);
			setControlProfile(profile);
			setReplaceOperatorToken('');
			setControlStatus('控制設定已保存。部分 server 參數會在下一次 request 或重啟後完全生效。');
		} catch (error) {
			setControlError(error instanceof Error ? error.message : 'Failed to save control profile');
		} finally {
			setControlSaving(false);
		}
	}

	function applyResolution(width: number, height: number): void {
		controlState.profile.camera.width = width;
		controlState.profile.camera.height = height;
	}

	onMount(() => {
		void loadPanel();
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
			<button class="ghost" type="button" onclick={() => void loadPanel(true)} disabled={controlState.loading || controlState.saving}>
				{controlState.loading ? '载入中…' : '重新读取'}
			</button>
			<button class="primary" type="button" onclick={() => void savePanel()} disabled={controlState.loading || controlState.saving}>
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
		<section class="panel-card">
			<header>
				<p class="section-tag">Camera</p>
				<h2>鏡頭與感知</h2>
			</header>

			<label class="toggle-row">
				<span>預設啟用鏡頭</span>
				<input type="checkbox" bind:checked={controlState.profile.camera.enabled}>
			</label>

			<div class="preset-row">
				{#each resolutionPresets as preset (preset.label)}
					<button
						type="button"
						class:active={controlState.profile.camera.width === preset.width && controlState.profile.camera.height === preset.height}
						onclick={() => applyResolution(preset.width, preset.height)}
					>
						{preset.label}
					</button>
				{/each}
			</div>

			<div class="field-grid two">
				<label>
					<span>Camera Width</span>
					<input type="number" min="160" max="4096" step="1" bind:value={controlState.profile.camera.width}>
				</label>
				<label>
					<span>Camera Height</span>
					<input type="number" min="120" max="2160" step="1" bind:value={controlState.profile.camera.height}>
				</label>
				<label>
					<span>Max Faces</span>
					<input type="number" min="1" max="32" step="1" bind:value={controlState.profile.camera.maxFaces}>
				</label>
				<label>
					<span>Max Hands</span>
					<input type="number" min="1" max="8" step="1" bind:value={controlState.profile.camera.maxHands}>
				</label>
				<label>
					<span>Max Crowd</span>
					<input type="number" min="1" max="64" step="1" bind:value={controlState.profile.camera.maxCrowd}>
				</label>
				<label>
					<span>Top N Hands</span>
					<input type="number" min="1" max="8" step="1" bind:value={controlState.profile.camera.topNHands}>
				</label>
				<label>
					<span>Processing Hz</span>
					<input type="number" min="1" max="120" step="1" bind:value={controlState.profile.camera.minProcessingHz}>
				</label>
				<label>
					<span>Camera Loading Floor</span>
					<input type="number" min="0" max="20000" step="50" bind:value={controlState.profile.camera.cameraLoadingMinMs}>
				</label>
				<label>
					<span>Crowd Cap</span>
					<input type="number" min="1" max="128" step="1" bind:value={controlState.profile.camera.crowdCap}>
				</label>
				<label>
					<span>Active Pinch Cap</span>
					<input type="number" min="1" max="64" step="1" bind:value={controlState.profile.camera.activeCap}>
				</label>
			</div>

			<div class="field-grid two compact">
				<label>
					<span>Face Detect</span>
					<input type="number" min="0.05" max="1" step="0.01" bind:value={controlState.profile.camera.faceDetectionConfidence}>
				</label>
				<label>
					<span>Face Track</span>
					<input type="number" min="0.05" max="1" step="0.01" bind:value={controlState.profile.camera.faceTrackingConfidence}>
				</label>
				<label>
					<span>Hand Detect</span>
					<input type="number" min="0.05" max="1" step="0.01" bind:value={controlState.profile.camera.handDetectionConfidence}>
				</label>
				<label>
					<span>Hand Track</span>
					<input type="number" min="0.05" max="1" step="0.01" bind:value={controlState.profile.camera.handTrackingConfidence}>
				</label>
			</div>

			<div class="segmented">
				<button type="button" class:active={controlState.profile.camera.handsModelComplexity === 0} onclick={() => (controlState.profile.camera.handsModelComplexity = 0)}>Hands Lite</button>
				<button type="button" class:active={controlState.profile.camera.handsModelComplexity === 1} onclick={() => (controlState.profile.camera.handsModelComplexity = 1)}>Hands Full</button>
			</div>
		</section>

		<section class="panel-card">
			<header>
				<p class="section-tag">Display</p>
				<h2>水幕與粒子</h2>
			</header>

			<label class="toggle-row">
				<span>預設開啟水幕</span>
				<input type="checkbox" bind:checked={controlState.profile.display.waterOverlay}>
			</label>

			<div class="field-grid two">
				<label>
					<span>Particle Min Size</span>
					<input type="number" min="0.5" max="64" step="0.1" bind:value={controlState.profile.display.particleSizeMin}>
				</label>
				<label>
					<span>Particle Max Size</span>
					<input type="number" min="0.5" max="128" step="0.1" bind:value={controlState.profile.display.particleSizeMax}>
				</label>
				<label>
					<span>Spawn Rate</span>
					<input type="number" min="1" max="240" step="1" bind:value={controlState.profile.display.spawnRate}>
				</label>
				<label>
					<span>Max Particles</span>
					<input type="number" min="50" max="20000" step="10" bind:value={controlState.profile.display.maxParticles}>
				</label>
				<label>
					<span>Drag</span>
					<input type="number" min="0" max="1" step="0.01" bind:value={controlState.profile.display.drag}>
				</label>
				<label>
					<span>Pixel Ratio</span>
					<input type="number" min="0.5" max="4" step="0.1" bind:value={controlState.profile.display.pixelRatio}>
				</label>
				<label>
					<span>Attraction</span>
					<input type="number" min="0" max="5" step="0.05" bind:value={controlState.profile.display.attractionStrength}>
				</label>
				<label>
					<span>Repulsion</span>
					<input type="number" min="0" max="5" step="0.05" bind:value={controlState.profile.display.repulsionStrength}>
				</label>
			</div>

			<label>
				<span>Canvas Clear Color</span>
				<div class="color-row">
					<input type="color" bind:value={controlState.profile.display.clearColor}>
					<input type="text" bind:value={controlState.profile.display.clearColor}>
				</div>
			</label>
		</section>

		<section class="panel-card">
			<header>
				<p class="section-tag">Config</p>
				<h2>Transport 與共用設定</h2>
			</header>

			<div class="field-grid">
				<label>
					<span>Socket URL</span>
					<input type="text" placeholder="auto" bind:value={controlState.profile.network.socketUrl}>
				</label>
				<label>
					<span>Reconnect Interval</span>
					<input type="number" min="250" max="60000" step="250" bind:value={controlState.profile.network.reconnectIntervalMs}>
				</label>
				<label>
					<span>Mobile Join Path</span>
					<input type="text" bind:value={controlState.profile.network.mobileJoinPath}>
				</label>
				<label>
					<span>QR Script URL</span>
					<input type="text" bind:value={controlState.profile.network.qrScriptUrl}>
				</label>
			</div>
		</section>

		<section class="panel-card">
			<header>
				<p class="section-tag">Server</p>
				<h2>Server 側設定</h2>
			</header>

			<div class="field-grid">
				<label>
					<span>Default Session Name</span>
					<input type="text" bind:value={controlState.profile.server.defaultSessionName}>
				</label>
				<label>
					<span>Session File Prefix</span>
					<input type="text" bind:value={controlState.profile.server.sessionFilePrefix}>
				</label>
				<label>
					<span>Sessions Directory</span>
					<input type="text" bind:value={controlState.profile.server.sessionsDir}>
				</label>
				<label>
					<span>Replace Operator Token</span>
					<input type="password" placeholder={controlState.profile.server.operatorTokenDefined ? '已配置，可輸入新 token 覆蓋' : '尚未配置'} value={controlState.replaceOperatorToken} oninput={(event) => setReplaceOperatorToken((event.currentTarget as HTMLInputElement).value)}>
				</label>
			</div>

			<p class="helper">`sessionsDir`、`sessionFilePrefix` 等 server owner 參數會先保存到 profile；部分既有記憶體快取或檔案句柄可能要到下一次 request 或重啟後完全反映。</p>
		</section>
	</div>

	<section class="panel-card palette-card-grid">
		<header>
			<p class="section-tag">MBTI</p>
			<h2>MBTI 顏色與 Palette</h2>
		</header>

		<div class="palette-grid">
			{#each MBTI_ORDER as mbti (mbti)}
				{@const palette = controlState.profile.mbti.palettes[mbti]}
				<article class="palette-entry">
					<div class="palette-head">
						<strong>{mbti}</strong>
						<span>{MBTI_NAMES[mbti]}</span>
					</div>

					<label>
						<span>Core</span>
						<div class="color-row">
							<input type="color" bind:value={palette.core}>
							<input type="text" bind:value={palette.core}>
						</div>
					</label>

					<label>
						<span>Mid</span>
						<div class="color-row">
							<input type="color" bind:value={palette.mid}>
							<input type="text" bind:value={palette.mid}>
						</div>
					</label>

					<label>
						<span>Edge</span>
						<div class="color-row">
							<input type="color" bind:value={palette.edge}>
							<input type="text" bind:value={palette.edge}>
						</div>
					</label>
				</article>
			{/each}
		</div>
	</section>
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

	.eyebrow,
	.section-tag {
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

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.field-grid.compact {
		margin-top: 16px;
	}

	label,
	.toggle-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 13px;
		letter-spacing: 0.04em;
		color: rgba(31, 41, 55, 0.72);
	}

	.toggle-row {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 12px 14px;
		margin-bottom: 16px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.64);
	}

	input[type='text'],
	input[type='password'],
	input[type='number'] {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid rgba(31, 41, 55, 0.12);
		border-radius: 14px;
		padding: 12px 14px;
		font: inherit;
		color: #111827;
		background: rgba(255, 255, 255, 0.94);
	}

	input[type='checkbox'] {
		width: 18px;
		height: 18px;
	}

	input[type='color'] {
		width: 48px;
		height: 42px;
		padding: 0;
		border: none;
		background: transparent;
	}

	.color-row {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr);
		gap: 10px;
		align-items: center;
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

	.palette-card-grid {
		margin-top: 18px;
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