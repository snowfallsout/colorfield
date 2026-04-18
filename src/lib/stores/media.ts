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

import { writable } from 'svelte/store';

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

// Placeholder lifecycle helpers; actual MediaPipe init/processing will live in services/mediapipe
export async function initCamera(): Promise<void> {
  // implementation will be provided by mediapipe service or DisplayCanvas
}

export function stopCamera(): void {
  // stop stream / cleanup
}
