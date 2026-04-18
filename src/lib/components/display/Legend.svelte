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

  // Derive a sorted list of items with percentage for rendering
  const entries = derived([mbtiCounts, total], ([$mb, $total]) =>
    Object.entries($mb || {})
      .map(([k, v]) => ({ k, v, pct: $total ? v / $total : 0 }))
      .sort((a, b) => b.v - a.v)
  );
</script>
<aside class="legend">
  <h3 class="legend-title">Present</h3>
  <div class="legend-rows">
    {#if $entries.length === 0}
      <div class="row empty">No participants yet</div>
    {/if}
    {#each $entries as item}
      <div class="row" class:on={item.v > 0}>
        <div class="dot" style="--c: {colorFor(item.k)}; background: {colorFor(item.k)}"></div>
        <div class="lbl">{item.k}</div>
        <div class="track">
          <div class="fill" style="width: {$total ? Math.round(item.pct * 100) + '%' : '0%'}; background: {colorFor(item.k)}"></div>
        </div>
        <div class="cnt">{item.v}</div>
      </div>
    {/each}
  </div>
</aside>

<style>
  /* Glass-style left panel inspired by static/display.html */
  .legend { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 32px rgba(31,38,135,0.07), inset 0 0 12px rgba(255,255,255,0.3); border-radius: 20px; padding: 18px 14px; min-width: 158px; z-index:25 }
  .legend-title { color: rgba(0,0,0,0.35); font-size: 9px; letter-spacing: 3px; text-align: center; text-transform: uppercase; margin-bottom: 14px }
  .legend-rows { display:flex; flex-direction:column; gap:6px }
  .row { display:flex; align-items:center; gap:7px; padding:2.5px 0; opacity:0.18; transform: translateX(6px); transition: opacity 0.4s, transform 0.4s }
  .row.on { opacity:1; transform: translateX(0) }
  .row.empty { color:#444; font-size:13px; opacity:1; transform:none }
  .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; filter: drop-shadow(0 0 4px var(--c)); }
  .lbl { color:#444; font-size:11px; font-weight:700; min-width:34px }
  .track { flex:1; height:3px; background: rgba(255,255,255,0.06); border-radius:2px; overflow:hidden }
  .fill { height:100%; border-radius:2px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); width:0% }
  .cnt { color: rgba(0,0,0,0.45); font-size:10px; min-width:16px; text-align:right }
</style>
