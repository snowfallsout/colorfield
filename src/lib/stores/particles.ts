/**
 * particles.ts — lightweight spawn/particle queue store
 *
 * Purpose:
 * - Provide a simple FIFO queue (Svelte store) for spawn/particle events that
 *   the display layer consumes asynchronously.
 *
 * Exports:
 * - `SpawnEvent` type — payload shape for spawn events.
 * - `spawnQueue` — `writable<SpawnEvent[]>` backing the queue.
 * - `pushSpawn(e)` — push event into queue (keeps capacity).
 * - `popSpawn()` — consume oldest event (used by display loop).
 * - `seedAmbient(n)` — helper to enqueue ambient/seed events.
 */

import { writable } from 'svelte/store';

export type SpawnEvent = { mbti: string; color?: string; nickname?: string; counts?: Record<string, number>; total?: number };

export const spawnQueue = writable<SpawnEvent[]>([]);

const QUEUE_CAP = 500;

export function pushSpawn(e: SpawnEvent) {
  spawnQueue.update(q => {
    if (q.length >= QUEUE_CAP) {
      // drop oldest to maintain cap
      q.shift();
    }
    q.push({ ...e, ts: Date.now() });
    return q;
  });
}

export function seedAmbient(n = 25) {
  // enqueue a seed instruction; DisplayCanvas will consume
  pushSpawn({ mbti: '__seed', color: String(n), nickname: 'ambient', counts: {}, total: 0 });
}

export function popSpawn(): SpawnEvent | undefined {
  let ev: SpawnEvent | undefined;
  spawnQueue.update(q => {
    ev = q.shift();
    return q;
  });
  return ev;
}
