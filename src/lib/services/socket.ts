import { browser } from '$app/environment';
import { mbtiCounts } from '$lib/stores/mbti';
import { sessionName, history } from '$lib/stores/session';
import { pushSpawn } from '$lib/stores/particles';
import { showToast } from '$lib/stores/ui';

let socket: any = null;

function safeEmit(event: string, payload: any) {
  if (!socket) return;
  try { socket.emit(event, payload); } catch (e) { /* ignore */ }
}

export async function connect(opts?: { url?: string }) {
  if (!browser) return;
  if (socket) return;

  // Try to use global `io` injected by CDN first, else dynamic import
  if ((window as any).io) {
    socket = (window as any).io(opts?.url || undefined);
  } else {
    try {
      const mod = await import('socket.io-client');
      socket = mod.io(opts?.url || undefined);
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
      pushSpawn({ mbti: data.mbti, color: data.color, nickname: data.nickname, counts: data.counts, total: data.total });
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
