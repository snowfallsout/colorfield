import { AMBIENT_COLS, MBTI_COLORS, MBTI_ORDER, MBTI_PALETTES, TWO_PI } from '$lib/shared/constants/mbti';
import type { RuntimeRuntimeState, RuntimeSpriteEntry, RuntimeSpriteSet } from '$lib/services/display/types';

type SpritePalette = {
  core: string;
  mid: string;
  edge: string;
};

const DOT_HALF = 80;
const BLOB_HALF = 128;
const FIELD_HALF = 160;
const DOT_REF_R = 16;

const spriteSetCache = new Map<string, RuntimeSpriteSet>();

function makeCanvas(half: number) {
  const size = half * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is unavailable');
  }
  return { canvas, ctx, cx: half, cy: half, size } as const;
}

function makeDot(color: string): RuntimeSpriteEntry {
  const { canvas, ctx, cx, cy, size } = makeCanvas(DOT_HALF);
  const outer = ctx.createRadialGradient(cx, cy, DOT_REF_R * 0.4, cx, cy, DOT_HALF);
  outer.addColorStop(0, `${color}BB`);
  outer.addColorStop(0.5, `${color}44`);
  outer.addColorStop(1, `${color}00`);
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, size, size);

  const inner = ctx.createRadialGradient(
    cx - DOT_REF_R * 0.28,
    cy - DOT_REF_R * 0.28,
    DOT_REF_R * 0.08,
    cx,
    cy,
    DOT_REF_R
  );
  inner.addColorStop(0, color);
  inner.addColorStop(0.22, `${color}DD`);
  inner.addColorStop(0.72, `${color}BB`);
  inner.addColorStop(1, `${color}00`);
  ctx.beginPath();
  ctx.arc(cx, cy, DOT_REF_R, 0, TWO_PI);
  ctx.fillStyle = inner;
  ctx.fill();

  return { canvas, half: DOT_HALF, refR: DOT_REF_R };
}

function makeBlob(palette: SpritePalette): RuntimeSpriteEntry {
  const { canvas, ctx, cx, cy } = makeCanvas(BLOB_HALF);
  const radius = BLOB_HALF * 0.85;
  const offsetX = cx - radius * 0.25;
  const offsetY = cy + radius * 0.15;
  const gradient = ctx.createRadialGradient(offsetX, offsetY, 0, cx, cy, radius);
  gradient.addColorStop(0, palette.core);
  gradient.addColorStop(0.45, palette.mid);
  gradient.addColorStop(0.85, `${palette.edge}88`);
  gradient.addColorStop(1, `${palette.edge}00`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.fill();
  return { canvas, half: BLOB_HALF, refR: BLOB_HALF * 0.35 };
}

function makeField(palette: SpritePalette): RuntimeSpriteEntry {
  const { canvas, ctx, cx, cy } = makeCanvas(FIELD_HALF);
  const radius = FIELD_HALF * 0.95;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `${palette.mid}55`);
  gradient.addColorStop(0.3, `${palette.edge}40`);
  gradient.addColorStop(0.65, `${palette.edge}22`);
  gradient.addColorStop(1, `${palette.edge}00`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-atop';
  for (let index = 0; index < 12; index++) {
    const bx = cx + (Math.random() - 0.5) * radius;
    const by = cy + (Math.random() - 0.5) * radius;
    const particleRadius = radius * (0.2 + Math.random() * 0.35);
    const wash = ctx.createRadialGradient(bx, by, 0, bx, by, particleRadius);
    const color = index % 2 === 0 ? palette.core : palette.mid;
    wash.addColorStop(0, `${color}20`);
    wash.addColorStop(1, `${color}00`);
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(bx, by, particleRadius, 0, TWO_PI);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  return { canvas, half: FIELD_HALF, refR: FIELD_HALF * 0.25 };
}

function buildSpriteSet(mbti: string): RuntimeSpriteSet {
  const color = MBTI_COLORS[mbti as keyof typeof MBTI_COLORS] || '#888888';
  const palette = (MBTI_PALETTES as Record<string, SpritePalette>)[mbti] || {
    core: color,
    mid: color,
    edge: color
  };
  return {
    dot: makeDot(color),
    blob: makeBlob(palette),
    field: makeField(palette)
  };
}

// Keep a lightweight sparkle helper local to the display runtime.
export function drawDiamondSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
  const sparkleSize = size * (2.5 + Math.random() * 2);
  const half = sparkleSize * 0.22;
  ctx.globalAlpha = alpha * (0.3 + Math.random() * 0.4);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y - sparkleSize);
  ctx.lineTo(x, y + sparkleSize);
  ctx.moveTo(x - sparkleSize, y);
  ctx.lineTo(x + sparkleSize, y);
  ctx.moveTo(x - half, y - half);
  ctx.lineTo(x + half, y + half);
  ctx.moveTo(x + half, y - half);
  ctx.lineTo(x - half, y + half);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 0.8, 0, TWO_PI);
  ctx.fill();
}

export function getSpriteSet(_state: RuntimeRuntimeState, mbti: string): RuntimeSpriteSet {
  const key = mbti || '';
  let spriteSet = spriteSetCache.get(key);
  if (!spriteSet) {
    spriteSet = buildSpriteSet(key);
    spriteSetCache.set(key, spriteSet);
  }
  return spriteSet;
}

export function getDotSprite(_state: RuntimeRuntimeState, color: string): RuntimeSpriteSet {
  const key = `__dot_${color}`;
  let spriteSet = spriteSetCache.get(key);
  if (!spriteSet) {
    const dot = makeDot(color);
    spriteSet = { dot, blob: dot, field: dot };
    spriteSetCache.set(key, spriteSet);
  }
  return spriteSet;
}

export function prewarmAll(): void {
  MBTI_ORDER.forEach((mbti) => {
    void getSpriteSet({} as RuntimeRuntimeState, mbti);
  });
  AMBIENT_COLS.forEach((color) => {
    void getDotSprite({} as RuntimeRuntimeState, color);
  });
}
