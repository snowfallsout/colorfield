import { writable } from 'svelte/store';
import { crowd } from '$lib/stores/media';
import { faceHash, pickRandomEmoji } from '$lib/utils/faceHash';

type Face = any;

// Internal mutable variables
let faces: Face[] = [];
let unsubCrowd: (() => void) | null = null;
let _wasAnySmiling = false;
let _emojiEl: HTMLDivElement | null = null;
let rafId: number | null = null;
let _container: HTMLElement | null = null;

const store = writable({ visible: false, emoji: '', x: 0, y: 0 });

export const smile = store;

function _createEmojiEl(container?: HTMLElement) {
  if (_emojiEl) return _emojiEl;
  const el = document.createElement('div');
  el.className = 'smile-emoji-persistent';
  el.setAttribute('aria-hidden', 'true');
  el.style.position = 'absolute';
  el.style.pointerEvents = 'none';
  el.style.userSelect = 'none';
  el.style.lineHeight = '1';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.5)';
  el.style.transition = 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  el.style.filter = 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))';
  el.style.zIndex = '25';
  const parent = container || document.body;
  parent.appendChild(el);
  _emojiEl = el;
  return el;
}

function _positionEl(face: Face) {
  if (!_emojiEl || !face) return;
  // Map normalized face.x/y to the container or window
  const parentRect = (_container && _container.getBoundingClientRect()) || { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
  const x = parentRect.left + (1 - (face.x ?? 0)) * parentRect.width;
  const y = parentRect.top + (face.y ?? 0) * parentRect.height;
  _emojiEl.style.left = x + 'px';
  _emojiEl.style.top = (y - 70) + 'px';
}

function _showEmojiForFace(face: Face) {
  const el = _createEmojiEl(_container || undefined);
  el.textContent = pickRandomEmoji();
  _positionEl(face);
  el.style.opacity = '1';
  el.style.transform = 'scale(1)';
  store.set({ visible: true, emoji: el.textContent || '', x: parseFloat(el.style.left || '0'), y: parseFloat(el.style.top || '0') });
}

function _hideEmoji() {
  if (!_emojiEl) return;
  _emojiEl.style.opacity = '0';
  _emojiEl.style.transform = 'scale(0.5)';
  store.set({ visible: false, emoji: '', x: 0, y: 0 });
}

function _tick() {
  try {
    const anySmiling = faces.some(f => f && f.smile);
    if (anySmiling) {
      if (!_wasAnySmiling) {
        const face = faces.find(f => f && f.smile) || faces[0];
        if (face) _showEmojiForFace(face);
      } else {
        const face = faces.find(f => f && f.smile) || faces[0];
        if (face) _positionEl(face);
      }
    } else {
      if (_wasAnySmiling) _hideEmoji();
    }
    _wasAnySmiling = anySmiling;
  } finally {
    rafId = requestAnimationFrame(_tick);
  }
}

export function start() {
  if (typeof window === 'undefined') return;
  if (unsubCrowd) return; // already started
  unsubCrowd = crowd.subscribe(c => { faces = c || []; });
  rafId = requestAnimationFrame(_tick);
}

export function stop() {
  if (unsubCrowd) { unsubCrowd(); unsubCrowd = null; }
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  _emojiEl = null;
  _wasAnySmiling = false;
  store.set({ visible: false, emoji: '', x: 0, y: 0 });
}

// Component registers its element so store can write styles/content to it
export function registerElement(el: HTMLDivElement) {
  _emojiEl = el;
}

export function unregisterElement() {
  _emojiEl = null;
}

