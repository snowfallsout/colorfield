/**
 * mbti.ts — MBTI counts store and spawn helper
 *
 * Module purpose:
 * - Maintain a simple counts map of MBTI labels used across the app.
 * - Provide a lightweight `spawn` helper that forwards a spawn event into the
 *   particle/spawn queue consumed by the display layer.
 *
 * Exports:
 * - `mbtiCounts`: `writable<Record<string, number>>` — counts per label.
 * - `total`: `derived<number>` — sum of all counts.
 * - `updateCounts(counts)`: set counts atomically.
 * - `spawn(mbti, color?, nickname?, counts?, totalNum?)`: enqueue a spawn event.
 *
 * Example:
 * ```ts
 * import { spawn } from '$lib/stores/mbti';
 * spawn('INTJ', '#ff0000', 'alice', { INTJ: 1 }, 1);
 * ```
 */

import { writable, derived } from 'svelte/store';
import { pushSpawn } from '$lib/runes/particles';

export const mbtiCounts = writable<Record<string, number>>({});
export const total = derived(mbtiCounts, $ => Object.values($).reduce((a, b) => a + b, 0));

export function updateCounts(counts: Record<string, number>) {
  mbtiCounts.set({ ...counts });
}

export function spawn(mbti: string, color?: string, nickname?: string, counts?: Record<string, number>, totalNum?: number) {
  // push a spawn event into the queue — DisplayCanvas will actively consume
  pushSpawn({ mbti, color, nickname, counts, total: totalNum });
}
