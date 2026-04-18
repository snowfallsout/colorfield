// Mediapipe helpers skeleton — Face Detector + Selective Hands strategy
// This module provides a browser-only API surface. Implementation will live
// in the client and must be invoked inside `onMount` or after user gesture.

import type { CrowdMember, InteractionPoint } from '$lib/stores/media';

export type MediapipeOptions = {
  faceDetectorModel?: string; // version or url
  handsModelComplexity?: 0 | 1;
  maxCrowd?: number;
  topNHands?: number;
  minProcessingHz?: number; // e.g. 20
};

// The public API:
//  - init(options): prepares lazy loader and model config
//  - start(videoEl, callbacks): starts getUserMedia binding and frame processing
//  - stop(): stops camera and processing
// Callbacks receive normalized coords only (0..1)

export async function init(options?: MediapipeOptions) {
  // Validate options; load required scripts lazily if needed.
  // Implementation note (not code): prefer MediaPipe Face Detector (fast)
  // to detect many faces → produce `CrowdMember[]` (cap at options.maxCrowd).
  // For selective hands: maintain a small priority list (closest/confident)
  // and run Hands/Holistic only on those ROIs at a lower rate.
}

export async function start(videoEl: HTMLVideoElement, onCrowdUpdate: (c: CrowdMember[]) => void, onInteractionsUpdate: (a: InteractionPoint[]) => void, opts?: MediapipeOptions) {
  // Start camera stream (or expect videoEl.srcObject is set by caller).
  // Set up a RAF loop with rate-limit for detector.send(). On each processed
  // frame, call the callbacks with normalized arrays.
  // Important: do NOT convert normalized -> pixel here. Stores should keep
  // normalized coords only.
}

export function stop() {
  // Stop processing and release models/streams
}

// Implementation details / notes for future coding:
// - Use a single Face Detector pass to produce many bounding boxes quickly.
// - Use a distance/size heuristic to pick Top‑N candidates for hands.
// - For each selected candidate, run Hands model on a cropped ROI (or use
//   Holistic if available) at a reduced frequency (e.g. 20Hz).
// - Provide graceful fallback when models fail or camera not allowed.
