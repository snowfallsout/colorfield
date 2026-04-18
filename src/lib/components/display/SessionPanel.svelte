<!--
  SessionPanel.svelte
  Doc: Displays session metadata and history and provides simple share/copy
  actions.
  Notation:
    - Reads `sessionName` and `history` from `$lib/stores/session`.
    - Does not mutate session state; actions are client-side only.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionName, history, loadHistory } from '$lib/stores/session';

  let origin = '';

  onMount(() => {
    origin = location.origin;
    // attempt to populate history if an implementation exists
    loadHistory().catch(() => {});
  });

  function copySession() {
    /*
      copySession()
      - Copy a shareable session URL to the clipboard using `navigator.clipboard`.
      - Falls back to `prompt` when clipboard API is unavailable.
    */
    if (!$sessionName) return;
    const url = `${origin}/join/${$sessionName}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      prompt('Copy session URL', url);
    }
  }
</script>

<aside class="session-panel">
  <div class="session-top">
    <div class="label">Session</div>
    <div class="name">{$sessionName || '—'}</div>
    <div class="actions">
      <button onclick={copySession} title="Copy session link">Copy</button>
    </div>
  </div>

  <div class="history">
    <h4>Recent Sessions</h4>
    {#if $history.length}
      <ul>
        {#each $history as item}
          <li>{item.name || item.id || JSON.stringify(item)}</li>
        {/each}
      </ul>
    {:else}
      <div class="empty">No history available</div>
    {/if}
  </div>
</aside>

<style>
.session-panel { position: fixed; left: 12px; top: 72px; z-index: 25; background: rgba(255,255,255,0.94); padding:10px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,.08); width:220px }
.session-top { display:flex; align-items:center; gap:8px }
.label { font-size:12px; color:#666 }
.name { flex:1; font-weight:700 }
.actions button { font-size:12px; padding:6px 8px }
.history { margin-top:8px; font-size:13px }
.history ul { margin:6px 0 0 0; padding:0; list-style:none }
.empty { color:#777; font-size:13px }
</style>
