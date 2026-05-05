/*
 * src/lib/utils/faceHash.ts
 * Purpose: Small face-hash helper and emoji picker used by smile state.
 */
import { SMILE_EMOJIS } from '$lib/shared/constants/vision';

export function faceHash(x: number, y: number) {
  return `${Math.round(x / 32)}_${Math.round(y / 32)}`;
}

export function pickRandomEmoji() {
  return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)];
}
