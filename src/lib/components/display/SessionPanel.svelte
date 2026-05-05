<!--
  SessionPanel.svelte
  Doc: Canonical display session manager backed by REST session APIs and the
  shared display state store.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { displayState } from '$lib/state/display.svelte';
  import {
    createDisplaySession,
    deleteDisplaySession,
    loadSessionOverview,
    regenerateJoinQr,
    restoreSavedIp,
    viewDisplaySession
  } from '$lib/services/display/session';

  onMount(() => {
    restoreSavedIp();
    void regenerateJoinQr();
    void loadSessionOverview();
  });

  function closePanel(): void {
    displayState.closeSessionPanel();
  }

  function copyJoinUrl(): void {
    const url = $displayState.sessionPanel.joinUrl;
    if (!url) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      prompt('Copy session URL', url);
    }
  }

  function handleBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.session-box')) return;
    closePanel();
  }

  function handleCreate(): void {
    void createDisplaySession();
  }

  function handleView(id: string): void {
    void viewDisplaySession(id);
  }

  function handleDelete(id: string): void {
    if (!confirm('确认删除此历史记录？')) return;
    void deleteDisplaySession(id);
  }

  function handleGenerateQr(): void {
    void regenerateJoinQr();
  }
</script>

<div class="session-panel" role="dialog" tabindex="0" onkeydown={(event: KeyboardEvent) => { if (event.key === 'Escape') closePanel(); }} onclick={handleBackdropClick}>
  <div class="session-box">
    <button id="sp-close" class="sp-close-btn" aria-label="Close sessions" onclick={closePanel} onkeydown={(event: KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); closePanel(); } }}>
      ×
    </button>
    <div class="session-top">
      <div class="label">Session</div>
      <div class="name">{$displayState.sessionName || '—'}</div>
      <div class="actions">
        <button class="sp-btn" onclick={copyJoinUrl} title="Copy session link" disabled={!$displayState.sessionPanel.joinUrl}>Copy</button>
      </div>
    </div>

    <h2>{$displayState.sessionPanel.title}</h2>
    <div class="sp-new">
      <input
        placeholder={$displayState.sessionPanel.newSessionPlaceholder}
        value={$displayState.sessionPanel.draftName}
        oninput={(event) => displayState.setSessionDraftName((event.currentTarget as HTMLInputElement).value)}
      />
      <button class="sp-btn" onclick={handleCreate} disabled={$displayState.sessionPanel.saving}>
        {$displayState.sessionPanel.saving ? '处理中…' : $displayState.sessionPanel.newSessionButtonLabel}
      </button>
    </div>

    <div class="sp-qr-section">
      <div class="sp-qr-input-row">
        <input
          id="sp-ip-input"
          placeholder={$displayState.sessionPanel.ipPlaceholder}
          value={$displayState.sessionPanel.hostInput}
          oninput={(event) => displayState.setSessionHostInput((event.currentTarget as HTMLInputElement).value)}
        />
        <button class="sp-btn" type="button" onclick={handleGenerateQr}>{$displayState.sessionPanel.generateQrButtonLabel}</button>
      </div>
      {#if $displayState.sessionPanel.joinQrDataUrl}
        <div class="sp-qr-preview">
          <img src={$displayState.sessionPanel.joinQrDataUrl} alt="Session join QR code" />
          <div class="sp-qr-url">{$displayState.sessionPanel.joinUrl}</div>
          <div class="sp-qr-hint">{$displayState.sessionPanel.qrHint}</div>
        </div>
      {/if}
      {#if $displayState.sessionPanel.error}
        <div class="sp-error">{$displayState.sessionPanel.error}</div>
      {/if}
    </div>

    <div id="sp-history-title">{$displayState.sessionPanel.historyTitle}</div>
    <div id="sp-history-list">
      {#if $displayState.sessionPanel.loading}
        <div class="sp-empty">读取中…</div>
      {:else if $displayState.sessionPanel.history.length}
        <ul>
          {#each $displayState.sessionPanel.history as item}
            <li>
              <div class="sp-row">
                <div class="sp-row-info">
                  <div class="sp-row-name">{item.name || item.id}</div>
                  <div class="sp-row-meta">{new Date(item.createdAt).toLocaleString()} · {item.total} 人参与</div>
                </div>
                <div class="sp-row-actions">
                  <button class="sp-btn" onclick={() => handleView(item.id)}>查看</button>
                  <button class="sp-btn danger" onclick={() => handleDelete(item.id)}>删除</button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="sp-empty">{$displayState.sessionPanel.emptyHistory}</div>
      {/if}
    </div>

    {#if $displayState.sessionPanel.selected}
      <div class="sp-detail">
        <div class="sp-detail-title">{$displayState.sessionPanel.selected.name}</div>
        <div class="sp-detail-meta">
          创建：{new Date($displayState.sessionPanel.selected.createdAt).toLocaleString()}<br>
          总人数：{$displayState.sessionPanel.selected.total}
        </div>
        {#if Object.keys($displayState.sessionPanel.selected.counts).length}
          <ul class="sp-detail-counts">
            {#each Object.entries($displayState.sessionPanel.selected.counts).sort((left, right) => right[1] - left[1]) as [mbti, count]}
              <li>{mbti}: {count}</li>
            {/each}
          </ul>
        {:else}
          <div class="sp-empty">无数据</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .session-panel { position: fixed; inset: 0; z-index: 100; background: rgba(220,228,255,0.55); backdrop-filter: blur(24px); display:flex; align-items:center; justify-content:center; pointer-events: all }
  .session-box { position: relative; background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4)); border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 8px 32px rgba(31,38,135,0.1), inset 0 0 16px rgba(255,255,255,0.4); border-radius: 24px; padding: 36px 40px; width: 520px; max-width: calc(100vw - 32px); max-height: 80vh; overflow-y: auto; color: #333 }
  .session-top { display:flex; align-items:center; gap:8px; margin-bottom: 18px }
  .label { font-size:12px; color:#666 }
  .name { flex:1; font-weight:700 }
  .actions button { font-size:12px; padding:6px 8px }
  .sp-new { display:flex; gap:10px; margin-bottom:24px }
  .sp-new input { flex:1; background: rgba(255,255,255,0.5); border: 1px solid rgba(100,120,180,0.25); border-radius: 12px; color: #333; font-size: 13px; padding: 10px 16px; outline: none }
  .sp-new input::placeholder { color: rgba(30,40,60,0.3) }
  .sp-btn { background: rgba(255,255,255,0.5); border: 1px solid rgba(100,120,180,0.3); border-radius: 12px; color: #444; font-size: 11px; letter-spacing: 2px; padding: 10px 20px; cursor: pointer; text-transform: uppercase }
  .sp-btn.danger { border-color: rgba(200,60,60,0.35); color: rgba(180,50,50,0.9) }
  #sp-history-title { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(30,40,60,0.3); margin-bottom: 12px }
  .sp-row { display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom: 1px solid rgba(0,0,0,0.06) }
  .sp-row:last-child { border-bottom: none }
  .sp-row-info { flex: 1 }
  .sp-row-name { font-size: 13px; color: rgba(30,40,60,0.85) }
  .sp-row-meta { font-size: 10px; color: rgba(30,40,60,0.4); letter-spacing: 1px; margin-top: 2px }
  .sp-row-actions { display:flex; gap:8px }
  .sp-close-btn { position: absolute; top: 12px; right: 12px; font-size: 20px; color: rgba(30,40,60,0.45); cursor: pointer; pointer-events: all; line-height: 1; background: transparent; border: none; padding: 6px; border-radius: 6px }
  .sp-close-btn:hover { color: rgba(30,40,60,0.75); background: rgba(0,0,0,0.03) }
  .sp-qr-section { margin-top:18px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.15); margin-bottom: 24px }
  .sp-qr-input-row { display:flex; gap:8px; align-items:center; margin-bottom: 12px }
  .sp-qr-input-row input { flex:1; background: rgba(255,255,255,0.5); border: 1px solid rgba(100,120,180,0.25); border-radius: 12px; color: #333; font-size: 13px; padding: 10px 16px; outline: none }
  .sp-qr-preview { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border-radius:16px; background: rgba(255,255,255,0.72) }
  .sp-qr-preview img { width: 180px; height: 180px; border-radius: 10px; background: #fff; padding: 6px; border: 1px solid rgba(200,210,230,0.45) }
  .sp-qr-url { font-size: 11px; color: rgba(30,40,60,0.45); word-break: break-all; text-align: center }
  .sp-qr-hint { font-size: 10px; color: rgba(30,40,60,0.35); letter-spacing: 2px; text-transform: uppercase; text-align: center }
  .sp-error { margin-top: 10px; color: rgba(180,50,50,0.95); font-size: 11px; letter-spacing: 1px }
  .sp-empty { color: rgba(30,40,60,0.4); font-size: 12px; padding: 16px 0 }
  .sp-detail { margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(0,0,0,0.08) }
  .sp-detail-title { font-size: 13px; color: rgba(30,40,60,0.85); font-weight: 600 }
  .sp-detail-meta { margin-top: 6px; font-size: 10px; color: rgba(30,40,60,0.45); letter-spacing: 1px; line-height: 1.8 }
  .sp-detail-counts { margin: 12px 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px }
  .sp-detail-counts li { font-size: 12px; color: rgba(30,40,60,0.75) }
  @media (max-width: 640px) {
    .session-box { padding: 28px 20px; width: calc(100vw - 24px) }
    .sp-new, .sp-qr-input-row { flex-direction: column; align-items: stretch }
    .sp-btn { width: 100% }
    .sp-row { flex-direction: column; align-items: stretch }
    .sp-row-actions { justify-content: flex-end }
    .sp-detail-counts { grid-template-columns: 1fr }
  }
</style>
