import { writable } from 'svelte/store';

export const sessionName = writable<string | null>(null);
export const history = writable<any[]>([]);

export async function loadHistory(): Promise<void> {
  // fetch('/api/sessions') implementation later
}

export async function createSession(name?: string): Promise<void> {
  // POST /api/sessions/new implementation later
}
