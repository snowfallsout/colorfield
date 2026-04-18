import { writable, derived } from 'svelte/store';
import { pushSpawn } from '$lib/stores/particles';

export const mbtiCounts = writable<Record<string, number>>({});
export const total = derived(mbtiCounts, $ => Object.values($).reduce((a, b) => a + b, 0));

export function updateCounts(counts: Record<string, number>) {
  mbtiCounts.set({ ...counts });
}

export function spawn(mbti: string, color?: string, nickname?: string, counts?: Record<string, number>, totalNum?: number) {
  // push a spawn event into the queue — DisplayCanvas will actively consume
  pushSpawn({ mbti, color, nickname, counts, total: totalNum });
}
