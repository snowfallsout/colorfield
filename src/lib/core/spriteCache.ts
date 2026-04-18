/**
 * spriteCache.ts
 * Minimal sprite cache for glowing particle sprites.
 *
 * Notation / API:
 * - getDot(color): returns an HTMLCanvasElement containing a pre-rendered
 *   radial dot sprite for the given color.
 *
 * Implementation note: this module uses an in-memory Map cache keyed by
 * `dot:${color}`. Sizes are fixed for simplicity but can be extended.
 */

export function makeDotSprite(color: string, size = 64) {
  /*
    makeDotSprite(color, size)
    - Create an in-memory canvas containing a pre-rendered radial dot sprite.
    - Uses a simple radial gradient from white -> color -> transparent.
    - Returned canvas size equals `size`.
  */
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  // simple radial gradient
  const g = ctx.createRadialGradient(cx, cy, size * 0.05, cx, cy, size * 0.5);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.2, color);
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

const cache = new Map<string, HTMLCanvasElement>();

export function getDot(color: string) {
  /*
    getDot(color)
    - Return a cached canvas sprite for `color`, creating it on first use.
    - Cache key is `dot:${color}`; this avoids repeated rendering overhead.
  */
  const key = `dot:${color}`;
  if (cache.has(key)) return cache.get(key)!;
  // Prefer the higher-fidelity dot while keeping the cache key for backwards compatibility
  const s = getHighFidelityDot(color);
  cache.set(key, s);
  return s;
}

/**
 * Higher-fidelity sprite generators
 *
 * The static display page pre-bakes several sprite variants (dot/blob/field)
 * at different sizes to achieve the soft-glow, eccentric gradient and subtle
 * wisps present in the original artwork. Below we provide improved
 * implementations while preserving the simple `getDot(color)` API for
 * backwards compatibility. New helpers `getBlob` and `getField` are also
 * provided for future use.
 */

function makeHighFidelityDot(color: string, sz = 160) {
  const c = document.createElement('canvas');
  c.width = c.height = sz;
  const g = c.getContext('2d')!;
  const cx = sz/2, cy = sz/2;
  const refR = Math.max(8, Math.floor(sz * 0.12));

  // Outer halo (soft, colored)
  const halo = g.createRadialGradient(cx, cy, refR*0.4, cx, cy, sz/2);
  halo.addColorStop(0, color + 'BB');
  halo.addColorStop(0.5, color + '44');
  halo.addColorStop(1, color + '00');
  g.fillStyle = halo;
  g.fillRect(0,0,sz,sz);

  // Ink-drop core with subtle multi-stop
  const core = g.createRadialGradient(cx, cy, 0, cx, cy, refR);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.12, color);
  core.addColorStop(0.5, color + 'DD');
  core.addColorStop(1, color + '00');
  g.beginPath(); g.arc(cx, cy, refR, 0, Math.PI*2); g.fillStyle = core; g.fill();

  return c;
}

function makeBlobSprite(palette: { core: string; mid: string; edge: string }, sz = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = sz;
  const g = c.getContext('2d')!;
  const cx = sz/2, cy = sz/2;
  const R = sz * 0.42;

  // Slight eccentric offset for 3D look
  const offsetX = cx - R * 0.18;
  const offsetY = cy + R * 0.12;
  const grad = g.createRadialGradient(offsetX, offsetY, 0, cx, cy, R);
  grad.addColorStop(0, palette.core);
  grad.addColorStop(0.45, palette.mid);
  grad.addColorStop(0.85, palette.edge + '88');
  grad.addColorStop(1, palette.edge + '00');
  g.fillStyle = grad;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI*2); g.fill();

  return c;
}

function makeFieldSprite(palette: { core: string; mid: string; edge: string }, sz = 320) {
  const c = document.createElement('canvas');
  c.width = c.height = sz;
  const g = c.getContext('2d')!;
  const cx = sz/2, cy = sz/2;
  const R = sz * 0.95/2;
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0, palette.mid + '55');
  grad.addColorStop(0.3, palette.edge + '40');
  grad.addColorStop(0.65, palette.edge + '22');
  grad.addColorStop(1, palette.edge + '00');
  g.fillStyle = grad;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI*2); g.fill();
  return c;
}

export function getBlob(key: string, palette: { core: string; mid: string; edge: string }) {
  const cacheKey = `blob:${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  const s = makeBlobSprite(palette, 256);
  cache.set(cacheKey, s);
  return s;
}

export function getField(key: string, palette: { core: string; mid: string; edge: string }) {
  const cacheKey = `field:${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  const s = makeFieldSprite(palette, 320);
  cache.set(cacheKey, s);
  return s;
}

// Override the simple small dot with a higher-fidelity default sized sprite
export function getHighFidelityDot(color: string) {
  const key = `hfdot:${color}`;
  if (cache.has(key)) return cache.get(key)!;
  const s = makeHighFidelityDot(color, 160);
  cache.set(key, s);
  return s;
}

// Keep the original `getDot` name but prefer the higher-fidelity variant
// when possible to improve visuals while remaining backward-compatible.
export function getDotHigh(color: string) {
  return getHighFidelityDot(color);
}

// Sprite set cache for MBTI pre-warm
const spriteSetCache = new Map<string, { dot: HTMLCanvasElement; blob: HTMLCanvasElement; field: HTMLCanvasElement }>();

// MBTI order and palettes copied from the original display implementation
export const MBTI_ORDER = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

export const MBTI_PALETTES: Record<string, { core: string; mid: string; edge: string }> = {
  INTJ: { core: '#1A0A2E', mid: '#4B0082', edge: '#E0B0FF' },
  INTP: { core: '#002366', mid: '#6495ED', edge: '#F0F8FF' },
  ENTJ: { core: '#8B0000', mid: '#FF4500', edge: '#FFD700' },
  ENTP: { core: '#FFD700', mid: '#FF00FF', edge: '#00FFFF' },
  INFJ: { core: '#2E0854', mid: '#00A86B', edge: '#F5F5DC' },
  INFP: { core: '#FF69B4', mid: '#DA70D6', edge: '#98FB98' },
  ENFJ: { core: '#FF4E50', mid: '#FC913A', edge: '#F9D423' },
  ENFP: { core: '#00D2FF', mid: '#92FE9D', edge: '#FF758C' },
  ISTJ: { core: '#2C3E50', mid: '#95A5A6', edge: '#ECF0F1' },
  ISFJ: { core: '#556B2F', mid: '#BDB76B', edge: '#FFFACD' },
  ESTJ: { core: '#000080', mid: '#4682B4', edge: '#D3D3D3' },
  ESFJ: { core: '#FF7F50', mid: '#FFB6C1', edge: '#E6E6FA' },
  ISTP: { core: '#1C1C1C', mid: '#4A4A4A', edge: '#00CCCC' },
  ISFP: { core: '#FF007F', mid: '#00CED1', edge: '#FFFFE0' },
  ESTP: { core: '#FFD700', mid: '#FF2400', edge: '#2F4F4F' },
  ESFP: { core: '#FF00FF', mid: '#7B68EE', edge: '#7FFFD4' },
};

// Ambient colors used by the static page
const AMBIENT_COLS = ['#003153','#C8A2C8','#F9A602','#9DC183','#40E0D0'];

export function getSpriteSet(mbti: string) {
  if (spriteSetCache.has(mbti)) return spriteSetCache.get(mbti)!;
  const palette = MBTI_PALETTES[mbti] || { core: '#ffffff', mid: '#cccccc', edge: '#888888' };
  const dot = getHighFidelityDot(palette.mid || palette.core);
  const blob = getBlob(mbti, palette);
  const field = getField(mbti, palette);
  const set = { dot, blob, field };
  spriteSetCache.set(mbti, set);
  return set;
}

// Pre-warm all MBTI sprite sets + ambient dots — only run in browser
if (typeof document !== 'undefined') {
  MBTI_ORDER.forEach(m => getSpriteSet(m));
  AMBIENT_COLS.forEach(c => getDot(c));
}
