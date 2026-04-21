import { browser } from '$app/environment';
import { mbtiCounts } from '$lib/runes/mbti';
import { MBTI_PALETTES } from '$lib/config/mbti';
import { sessionName, history } from '$lib/runes/session';
import { pushSpawn } from '$lib/runes/particles';
import { showToast } from '$lib/runes/ui';

let socket: any = null;

function safeEmit(event: string, payload: any) {
  if (!socket) return;
  try { socket.emit(event, payload); } catch (e) { /* ignore */ }
}

export async function connect(opts?: { url?: string }) {
  if (!browser) return;
  if (socket) return;
  // determine socket URL priority:
  // 1. explicit opts.url
  // 2. undefined -> connect to same origin
  const url = opts?.url ?? undefined;

  // Try to use global `io` injected by CDN first, else dynamic import
  if ((window as any).io) {
    socket = (window as any).io(url);
  } else {
    try {
      const mod = await import('socket.io-client');
      socket = mod.io(url);
    } catch (e) {
      console.warn('socket.io client not available:', e);
      showToast('Socket unavailable', '#ff4444');
      return;
    }
  }

  socket.on('connect', () => showToast('Socket connected', '#4caf50'));
  socket.on('connect_error', (err: any) => showToast('Socket connect error', '#ff6b6b'));
  socket.on('disconnect', () => showToast('Socket disconnected', '#ffb86b'));

  socket.on('state', (data: any) => {
    if (data && data.counts) mbtiCounts.set({ ...data.counts });
    if (data && data.session) sessionName.set(data.session.name || null);
  });

  socket.on('spawn_particles', (data: any) => {
    try {
      // Push to spawnQueue; DisplayCanvas will consume it
      const mbtiKey = (data?.mbti || '').toUpperCase();
      const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
      const color = data.color || (palette ? palette.mid || palette.core : undefined);
      pushSpawn({ mbti: mbtiKey, color, nickname: data.nickname, counts: data.counts, total: data.total });
      if (data.counts) mbtiCounts.set({ ...data.counts });
      if (data.total !== undefined) {
        // no-op here; UI can derive total from mbtiCounts
      }
      showToast(`✦ ${data.mbti} ${data.nickname || ''} joined`, data.color || '#ffffff');
    } catch (e) { /* swallow */ }
  });

  socket.on('session_reset', (data: any) => {
    // reset counts and notify
    if (data && data.counts) mbtiCounts.set({ ...data.counts });
    if (data && data.session) sessionName.set(data.session.name || null);
    showToast('✦ 新场次已开始', '#ffffff');
  });
}

export function emit(event: string, payload: any) { safeEmit(event, payload); }

export function disconnect() {
  if (socket) { socket.disconnect(); socket = null; }
}

// Allow consumers to register custom event handlers
export function on(event: string, cb: (...args: any[]) => void) {
  if (!socket) return;
  try { socket.on(event, cb); } catch (e) { /* ignore */ }
}
