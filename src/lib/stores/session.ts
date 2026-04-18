/**
 * session.ts — session store and helpers
 *
 * Purpose:
 * - Keep the current `sessionName` and a lightweight `history` array.
 * - Provide placeholders for session-related API helpers.
 *
 * Exports:
 * - `sessionName`: `writable<string | null>` — current session ID/name.
 * - `history`: `writable<any[]>` — loaded session history entries.
 * - `loadHistory()`: placeholder for fetching session list.
 * - `createSession(name?)`: placeholder for creating a new session.
 *
 * Implementation note: actual network calls should live in route handlers or a
 * small service module; these helpers are intentionally minimal.
 */

import { writable } from 'svelte/store';

export const sessionName = writable<string | null>(null);
export const history = writable<any[]>([]);
// control whether the SessionPanel is visible
export const panelOpen = writable<boolean>(false);

export async function loadHistory(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('cf_session_history');
    if (!raw) {
      history.set([]);
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) history.set(parsed);
    else history.set([]);
  } catch (e) {
    history.set([]);
  }
}

export async function createSession(name?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const id = name && name.length ? name : `s_${Date.now()}_${Math.floor(Math.random()*9000)+1000}`;
  const entry = { id, name: name || id, createdAt: Date.now() };
  // prepend to history, dedupe and limit size
  const MAX_HISTORY = 30;
  let cur: any[] = [];
  history.update(h => {
    const arr = (h || []).filter(it => it.id !== entry.id);
    arr.unshift(entry);
    if (arr.length > MAX_HISTORY) arr.length = MAX_HISTORY;
    cur = arr;
    return cur;
  });
  try { localStorage.setItem('cf_session_history', JSON.stringify(cur)); } catch(e) {}
  // set active session
  sessionName.set(entry.id);
}

export function getJoinUrl(name?: string) {
  if (!name) return '';
  if (typeof window === 'undefined') return `/join/${name}`;
  return `${location.origin}/join/${name}`;
}

export function deleteSession(id: string) {
  if (typeof window === 'undefined') return;
  let cur: any[] = [];
  history.update(h => { cur = (h || []).filter(i => i.id !== id); return cur; });
  try { localStorage.setItem('cf_session_history', JSON.stringify(cur)); } catch(e) {}
}

export function viewSession(id: string) {
  // Set active session name (consumer can react to this)
  sessionName.set(id);
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  history.set([]);
  try { localStorage.removeItem('cf_session_history'); } catch (e) {}
}
