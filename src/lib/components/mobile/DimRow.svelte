<script lang="ts">
/**
 * DimRow.svelte — A row of two dimension buttons
 *
 * File-level:
 * Renders a horizontal pair of `DimButton` controls representing a
 * single MBTI dimension. Emits `select` with `{ dimension, value }`.
 */
import DimButton from './DimButton.svelte';
import { createEventDispatcher } from 'svelte';
const { dimension = 0 as number, values = [] as { value: string; hint?: string }[], selected = null as string | null } = $props();
const dispatch = createEventDispatcher();

/**
 * handleToggle(ev)
 * Relay a child's toggle event up as a `select` event.
 *
 * @param ev - CustomEvent from DimButton with `detail.value`
 */
function handleToggle(ev: CustomEvent) { dispatch('select', { dimension, value: ev.detail.value }); }
</script>

<div class="dim-row">
  {#each values as v}
    <DimButton value={v.value} hint={v.hint} selected={selected === v.value} on:toggle={handleToggle} />
  {/each}
</div>

<style>
.dim-row{display:flex;gap:8px;margin-bottom:8px;width:100%;max-width:300px}
</style>
