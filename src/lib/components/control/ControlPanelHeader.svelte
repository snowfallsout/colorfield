<!--
  ControlPanelHeader.svelte
  Doc: Header section for the control route. It keeps the top copy, reload/save actions, and the current feedback banner in one small view component.
-->

<script lang="ts">
	type ControlPanelHeaderProps = {
		loading: boolean;
		saving: boolean;
		error: string;
		status: string;
		onReload: () => void | Promise<void>;
		onSave: () => void | Promise<void>;
	};

	let { loading, saving, error, status, onReload, onSave }: ControlPanelHeaderProps = $props();
</script>

<section class="hero">
	<div class="hero-copy">
		<p class="eyebrow">Top-Level Control</p>
		<h1>Control Panel</h1>
		<p class="lead">用最少的界面，直接控制 display、mobile 與共用 runtime 的核心參數。</p>
	</div>
	<div class="hero-actions">
		<button class="ghost" type="button" onclick={onReload} disabled={loading || saving}>
			{loading ? '载入中…' : '重新读取'}
		</button>
		<button class="primary" type="button" onclick={onSave} disabled={loading || saving}>
			{saving ? '保存中…' : '保存控制設定'}
		</button>
	</div>
</section>

{#if error}
	<p class="banner error">{error}</p>
{:else if status}
	<p class="banner ok">{status}</p>
{/if}

<style>
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

	button.ghost {
		background: rgba(255, 255, 255, 0.76);
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

	@media (max-width: 760px) {
		.hero {
			flex-direction: column;
			align-items: stretch;
		}

		.hero-actions {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>