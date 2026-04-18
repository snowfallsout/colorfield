/**
 * ui.ts — small UI helper stores
 *
 * Exports:
 * - `toast`: `{ msg: string; color?: string } | null` — current toast message.
 * - `handBadgeText`: `string` — small hand badge display text.
 * - `waitingVisible`: `boolean` — global waiting indicator visibility.
 * - `showToast(msg, color?)`: helper to show a toast for ~3s.
 */

import { writable } from 'svelte/store';

export const toast = writable<{ msg: string; color?: string } | null>(null);
export const handBadgeText = writable<string>('✋ NO HAND');
export const waitingVisible = writable<boolean>(true);

export function showToast(msg: string, color?: string) {
  toast.set({ msg, color });
  setTimeout(() => toast.set(null), 3000);
}
