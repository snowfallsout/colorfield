<!--
  Legend.svelte
  Doc: Visual legend showing MBTI counts and totals.
  Notation:
    - Reads `mbtiCounts` and `total` from `$lib/stores/mbti` (counts are simple integers)
    - Presentation-only; generates simple colors deterministically from MBTI key.
-->

<script lang="ts">
  import { derived } from 'svelte/store';
  import { mbtiCounts, total } from '$lib/stores/mbti';

  /*
    colorFor(key)
    - Deterministically generate a pleasant color hex from a short key string.
    - Lightweight fallback when no explicit palette is available.
  */
  function colorFor(key: string) {
    const seed = Array.from(key).reduce((s, c) => s + c.charCodeAt(0), 0);
    const r = (seed * 137) % 200 + 30;
    const g = (seed * 61) % 200 + 30;
    const b = (seed * 29) % 200 + 30;
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Derive a sorted list of [key, count] pairs for rendering
  const entries = derived(mbtiCounts, $ => Object.entries($).sort((a,b) => b[1] - a[1]));
</script>

<aside class="legend">
  <div class="legend-header">Participants — Total: {$total}</div>
  <ul>
    {#each $entries as [k, v]}
      <li style="--col: {colorFor(k)}">
        <span class="swatch" style="background: {colorFor(k)}"></span>
        <span class="key">{k}</span>
        <span class="count">{v}</span>
      </li>
    {/each}
    {#if $entries.length === 0}
      <li class="empty">No participants yet</li>
    {/if}
  </ul>
</aside>

<style>
.legend { position: fixed; right: 12px; top: 72px; z-index: 25; background: rgba(255,255,255,0.92); padding:8px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,.08); max-width:220px; }
.legend-header { font-weight:600; margin-bottom:6px; font-size:13px }
.legend ul { list-style:none; margin:0; padding:0; display:block; }
.legend li { display:flex; align-items:center; gap:8px; padding:6px 4px; border-radius:6px; }
.legend li.empty { color:#777; font-size:13px }
.swatch { width:14px; height:14px; border-radius:3px; box-shadow:inset 0 -1px 0 rgba(0,0,0,.06); }
.key { flex:1; font-size:13px; color:#111 }
.count { font-weight:700; font-size:12px; color:#222 }
</style>
