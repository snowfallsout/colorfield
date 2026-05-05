/*
 * mobile.logic.ts
 * Purpose: Local mobile MBTI helpers for selection state, card copy, color math,
 * and the share-image canvas generator used by the mobile flow.
 */
import { MBTI_COLORS as SHARED_MBTI_COLORS, MBTI_NAMES as SHARED_MBTI_NAMES } from '$lib/shared/constants/mbti';

export type MobileScreen = 'welcome' | 'mbti' | 'result';

export type MobileSelection = [string | null, string | null, string | null, string | null];

export type MobileDimensionOption = {
  value: string;
  hint: string;
};

export type MobileDimensionRow = {
  dimension: number;
  values: readonly MobileDimensionOption[];
};

export type MobileDimensionSelection = {
  dimension: number;
  value: string;
};

export type MobileSelectionPreview = {
  value: string;
  isPlaceholder: boolean;
};

export type MobileSelectionCopy = {
  nameCn: string;
  nameEn: string;
  num: string;
};

export type MobileCardColors = {
  c0: string;
  c1: string;
  c2: string;
  c3: string;
};

export const MBTI_NAMES: Record<string, string> = SHARED_MBTI_NAMES;

export const MBTI_COLORS: Record<string, string> = SHARED_MBTI_COLORS;

export const MOBILE_PLACEHOLDERS = ['M', 'B', 'T', 'I'] as const;

export const MOBILE_DIMENSIONS: readonly MobileDimensionRow[] = [
  {
    dimension: 0,
    values: [
      { value: 'E', hint: 'Extrovert' },
      { value: 'I', hint: 'Introvert' }
    ]
  },
  {
    dimension: 1,
    values: [
      { value: 'N', hint: 'Intuitive' },
      { value: 'S', hint: 'Sensing' }
    ]
  },
  {
    dimension: 2,
    values: [
      { value: 'T', hint: 'Thinking' },
      { value: 'F', hint: 'Feeling' }
    ]
  },
  {
    dimension: 3,
    values: [
      { value: 'J', hint: 'Judging' },
      { value: 'P', hint: 'Perceiving' }
    ]
  }
] as const;

const LETTER_COLORS: Record<string, string> = {
  E: '#FF6B4A',
  I: '#5B5B9F',
  N: '#9B6BDB',
  S: '#4AB8A0',
  T: '#4A7BD6',
  F: '#FF6FA3',
  J: '#F5A94A',
  P: '#7DD87D'
};

export function createEmptySelection(): MobileSelection {
  return [null, null, null, null];
}

export function setSelectionValue(selection: MobileSelection, dimension: number, value: string): MobileSelection {
  if (dimension < 0 || dimension >= selection.length) return selection;
  selection[dimension] = value;
  return selection;
}

export function getSelectionMbti(selection: MobileSelection): string {
  return selection.map((value) => value || '').join('');
}

export function getSelectionCount(selection: MobileSelection): number {
  return selection.reduce((count, value) => count + (value ? 1 : 0), 0);
}

export function isSelectionComplete(selection: MobileSelection): boolean {
  return selection.every(Boolean);
}

export function getSelectionPreview(selection: MobileSelection): MobileSelectionPreview[] {
  return selection.map((value, index) => ({
    value: value || MOBILE_PLACEHOLDERS[index],
    isPlaceholder: !value
  }));
}

export function getSelectionCopy(selection: MobileSelection): MobileSelectionCopy {
  const mbti = getSelectionMbti(selection);
  const count = getSelectionCount(selection);

  if (isSelectionComplete(selection)) {
    const key = mbti as keyof typeof MBTI_NAMES;
    return {
      nameCn: MBTI_NAMES[key] || '—',
      nameEn: mbti,
      num: mbti
    };
  }

  return {
    nameCn: mbti || '—',
    nameEn: mbti ? `${count}/4` : 'Select four dimensions',
    num: mbti || '—'
  };
}

export function resolveLuckyNickname(nickname: string | null | undefined, mbti: string): string {
  if (nickname && nickname.trim()) return nickname.trim();
  const key = mbti.toUpperCase() as keyof typeof MBTI_NAMES;
  return MBTI_NAMES[key] || '';
}

export function hexToRgb(hex: string) {
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((part) => part + part).join('');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

export function mix(left: string, right: string, ratio: number) {
  const leftRgb = hexToRgb(left);
  const rightRgb = hexToRgb(right);
  return `rgb(${Math.round(leftRgb.r * (1 - ratio) + rightRgb.r * ratio)},${Math.round(leftRgb.g * (1 - ratio) + rightRgb.g * ratio)},${Math.round(leftRgb.b * (1 - ratio) + rightRgb.b * ratio)})`;
}

export function lighten(hex: string, amount: number) {
  const rgb = hexToRgb(hex);
  return `rgb(${Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount))},${Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount))},${Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount))})`;
}

export function deriveMobileCardColors(selection: MobileSelection): MobileCardColors {
  const complete = isSelectionComplete(selection);
  let c0: string;
  let c1: string;
  let c2: string;
  let c3: string;

  if (complete) {
    const mbti = getSelectionMbti(selection);
    const main = MBTI_COLORS[mbti] || '#888';
    c0 = lighten(main, 0.55);
    c1 = lighten(main, 0.25);
    c2 = mix(main, LETTER_COLORS[selection[2] || ''] || main, 0.25);
    c3 = main;
  } else if (selection.some(Boolean)) {
    const picked = selection.map((value) => (value ? LETTER_COLORS[value] : null));
    const fallback = '#cfd2de';
    c0 = picked[0] ? lighten(picked[0], 0.6) : '#eceef5';
    c1 = picked[1] ? lighten(picked[1], 0.35) : (picked[0] ? lighten(picked[0], 0.4) : '#dcdee7');
    c2 = picked[2] ? lighten(picked[2], 0.1) : (picked[1] ? lighten(picked[1], 0.15) : '#cfd2de');
    c3 = picked[3] || picked[2] || picked[1] || picked[0] || fallback;
  } else {
    c0 = '#eceef5';
    c1 = '#dcdee7';
    c2 = '#cfd2de';
    c3 = '#bec2d2';
  }

  return { c0, c1, c2, c3 };
}
