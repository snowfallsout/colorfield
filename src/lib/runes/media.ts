/**
 * media.ts — Media/sensor stores and helpers
 *
 * Purpose:
 * - Provide normalized, lightweight stores for camera/crowd/interaction data.
 * - Keep DOM refs (video element) and flags separate from raw pixel processing.
 *
 * Types:
 * - `CrowdMember` — normalized face/center data (x,y in [0,1]).
 * - `InteractionPoint` — normalized hand/interaction point.
 *
 * Exports:
 * - `videoEl`, `camOn` — DOM refs and camera flag.
 * - `crowd`, `CROWD_CAP` — tracked crowd members array and capacity.
 * - `activeInteractions`, `ACTIVE_CAP` — active hand/interaction positions.
 * - `emotion` — derived lightweight emotion flag.
 * - lifecycle/helpers: `setCrowd`, `pushCrowdMember`, `setActiveInteractions`, `clearAllSensors`, `initCamera`, `stopCamera`.
 *
 * Notes:
 * - All coordinates are normalized (0..1). `y` follows MediaPipe convention (top→bottom).
 */

import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import settings from '$lib/config/settings';
import { handBadgeText } from '$lib/runes/ui';
import { init as initMediapipe, start as startMediapipe, stop as stopMediapipe } from '$lib/services/mediapipe';

// Normalized coords only: x,y in [0,1], y is top→bottom as MediaPipe
export type CrowdMember = {
  id?: string;
  x: number; // normalized
  y: number; // normalized
  size?: number; // normalized box size or face size proxy
  conf?: number;
  ts?: number; // timestamp ms
};

export type InteractionPoint = {
  id?: string; // optional tracked id
  x: number; // normalized
  y: number; // normalized
  score?: number; // confidence
  ts?: number;
};

// DOM refs / flags (only store refs, not pixel coords)
export const videoEl = writable<HTMLVideoElement | null>(null);
export const camOn = writable<boolean>(false);

// Dual-layer data model
// Crowd: up to `CROWD_CAP` face centers (normalized)
export const CROWD_CAP = 30;
export const crowd = writable<CrowdMember[]>([]);

// Active Interactions: Top-K hand positions (normalized)
export const ACTIVE_CAP = 8;
export const activeInteractions = writable<InteractionPoint[]>([]);

// Derived lightweight flags
export const emotion = writable<'neutral' | 'smile'>('neutral');

let _starting = false;
let _started = false;

// Helpers — always accept normalized coords, enforce caps, and attach ts
export function setCrowd(m: CrowdMember[]) {
  const ts = Date.now();
  const trimmed = m.slice(0, CROWD_CAP).map(it => ({ ...it, ts: it.ts || ts }));
  crowd.set(trimmed);
}

export function pushCrowdMember(it: CrowdMember) {
  crowd.update(arr => {
    const ts = Date.now();
    const next = [{ ...it, ts }, ...arr].slice(0, CROWD_CAP);
    return next;
  });
}

export function setActiveInteractions(a: InteractionPoint[]) {
  const ts = Date.now();
  const trimmed = a.slice(0, ACTIVE_CAP).map(it => ({ ...it, ts: it.ts || ts }));
  activeInteractions.set(trimmed);
}

export function clearAllSensors() {
  crowd.set([]);
  activeInteractions.set([]);
  emotion.set('neutral');
}

export async function initCamera(): Promise<void> {
  if (!browser) return;
  if (_starting || _started) return;

  _starting = true;
  handBadgeText.set('✋ HAND TRACKING INIT');

  try {
    const el = ensureVideoElement();
    if (!el) throw new Error('video element is unavailable');

    await initMediapipe({
      maxCrowd: CROWD_CAP,
      topNHands: Math.min(2, ACTIVE_CAP),
      minProcessingHz: 20,
      handsModelComplexity: 1,
      handConfidenceThreshold: settings.mediapipe.handConfidenceThreshold,
      faceConfidenceThreshold: settings.mediapipe.faceConfidenceThreshold
    });

    await startMediapipe(
      el,
      (members) => {
        setCrowd(members);
        const smileCount = (members as any[]).reduce((n, m) => n + ((m as any)?.smile ? 1 : 0), 0);
        const hasFaces = members.length > 0;
        emotion.set(hasFaces && smileCount > members.length * 0.5 ? 'smile' : 'neutral');
      },
      (points) => {
        setActiveInteractions(points);
        handBadgeText.set(points.length > 0 ? `✋ ${points.length} PINCH` : '✋ NO HAND');
      },
      {
        maxCrowd: CROWD_CAP,
        topNHands: Math.min(2, ACTIVE_CAP),
        minProcessingHz: 20,
        handsModelComplexity: 1,
        handConfidenceThreshold: settings.mediapipe.handConfidenceThreshold,
        faceConfidenceThreshold: settings.mediapipe.faceConfidenceThreshold
      }
    );

    camOn.set(true);
    _started = true;
  } catch (e) {
    console.warn('initCamera failed:', e);
    camOn.set(false);
    clearAllSensors();
    handBadgeText.set('✋ NO HAND');
    throw e;
  } finally {
    _starting = false;
  }
}

export function stopCamera(): void {
  if (!browser) return;

  stopMediapipe();
  clearAllSensors();
  camOn.set(false);
  handBadgeText.set('✋ NO HAND');
  _started = false;
}

function ensureVideoElement(): HTMLVideoElement | null {
  const stored = get(videoEl);
  if (stored && stored.isConnected) return stored;

  const existing = document.getElementById('video-bg');
  if (existing instanceof HTMLVideoElement) {
    videoEl.set(existing);
    return existing;
  }

  const created = document.createElement('video');
  created.id = 'video-bg';
  created.autoplay = true;
  created.muted = true;
  created.playsInline = true;
  created.style.display = 'none';
  created.setAttribute('aria-hidden', 'true');
  document.body.appendChild(created);
  videoEl.set(created);
  return created;
}
