import { writable } from 'svelte/store';

export const toast = writable<{ msg: string; color?: string } | null>(null);
export const handBadgeText = writable<string>('✋ NO HAND');
export const waitingVisible = writable<boolean>(true);

export function showToast(msg: string, color?: string) {
  toast.set({ msg, color });
  setTimeout(() => toast.set(null), 3000);
}
