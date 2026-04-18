/**
 * src/lib/types/mobile.d.ts
 * Type definitions for the mobile MBTI flow components and events.
 *
 * These types describe the public props and event payloads used by
 * `MBTICard`, `DimRow`, `DimButton`, `HoloCardPreview`, and the page
 * composition. Keep definitions compact and focused to share across
 * components and the page entrypoint.
 */

/** A 4-slot MBTI selection where each slot is a single letter or null */
export type MBTISelection = [string | null, string | null, string | null, string | null];

/** Single dimension option displayed in `DimRow` */
export type DimValue = { value: string; hint?: string };

/** Options accepted by the holo card generator */
export type HoloOptions = {
  mbti: string; // four-letter MBTI
  color: string; // hex color string
  nickname?: string;
  phrase?: string;
};

/** Event payload emitted from `MBTICard` when a letter is selected */
export type MBTICardSelectEvent = { index: number; value: string };

/** Event payload emitted from `DimButton` when toggled */
export type DimToggleEvent = { value: string };

/** Event payload emitted from `DimRow` when a value is selected */
export type DimRowSelectEvent = { dimension: number; value: string };

/** Result emitted after holo image generation */
export type HoloGeneratedEvent = { url: string | null };
