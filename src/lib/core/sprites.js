/*
  sprites.js
  說明：建立並快取多種粒子精靈（dot/blob/field）。
  - 提供 `getSpriteSet(mbti)` 取得對應 MBTI 類型的三種 sprite。
  - 提供 `getDotSprite(color)` 為 ambient/drift 顆粒建立 fallback dot。
  - `prewarmAll()` 可在啟動時預先建立所有 sprite。
*/
import { MBTI_COLORS, MBTI_PALETTES, MBTI_ORDER, AMBIENT_COLS } from './constants.js';

// Sprite 尺寸常數
const DOT_HALF   = 80;    // 160×160
const BLOB_HALF  = 128;   // 256×256
const FIELD_HALF = 160;   // 320×320
const DOT_REF_R  = 16;    // reference radius for dot sprite

const spriteSetCache = new Map();

/**
 * 建立一個離線 canvas 供 sprite 繪製使用。
 * @param {number} half - 半尺寸（sprite 半寬）
 * @returns {{canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D, cx:number, cy:number, sz:number}}
 */
function _makeCanvas(half) {
  const sz = half * 2;
  const c  = document.createElement('canvas');
  c.width = c.height = sz;
  return { canvas: c, ctx: c.getContext('2d'), cx: half, cy: half, sz };
}

/**
 * 建立 dot 精靈：白熱核心 + 單色暈染
 * @param {string} color - HEX 顏色字串
 * @returns {{canvas:HTMLCanvasElement, half:number, refR:number}}
 */
function _makeDot(color) {
  const { canvas, ctx: g, cx, cy, sz } = _makeCanvas(DOT_HALF);
  const g1 = g.createRadialGradient(cx, cy, DOT_REF_R * .4, cx, cy, DOT_HALF);
  g1.addColorStop(0,  color + 'BB');
  g1.addColorStop(.5, color + '44');
  g1.addColorStop(1,  color + '00');
  g.fillStyle = g1; g.fillRect(0, 0, sz, sz);
  const g2 = g.createRadialGradient(
    cx - DOT_REF_R * .28, cy - DOT_REF_R * .28, DOT_REF_R * .08,
    cx, cy, DOT_REF_R
  );
  g2.addColorStop(0,   color);
  g2.addColorStop(.22, color + 'DD');
  g2.addColorStop(.72, color + 'BB');
  g2.addColorStop(1,   color + '00');
  g.beginPath(); g.arc(cx, cy, DOT_REF_R, 0, Math.PI*2);
  g.fillStyle = g2; g.fill();
  return { canvas, half: DOT_HALF, refR: DOT_REF_R };
}

/**
 * 建立 blob 精靈：偏心徑向漸層，製造流體球感
 * @param {{core:string, mid:string, edge:string}} palette
 * @returns {{canvas:HTMLCanvasElement, half:number, refR:number}}
 */
function _makeBlob(palette) {
  const { canvas, ctx: g, cx, cy } = _makeCanvas(BLOB_HALF);
  const R = BLOB_HALF * 0.85;
  const offsetX = cx - R * 0.25;
  const offsetY = cy + R * 0.15;
  const grad = g.createRadialGradient(offsetX, offsetY, 0, cx, cy, R);
  grad.addColorStop(0,    palette.core);
  grad.addColorStop(0.45, palette.mid);
  grad.addColorStop(0.85, palette.edge + '88');
  grad.addColorStop(1,    palette.edge + '00');
  g.fillStyle = grad; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI*2); g.fill();
  return { canvas, half: BLOB_HALF, refR: BLOB_HALF * .35 };
}

/**
 * 建立 field 精靈：超柔和的大面積光暈
 * @param {{core:string, mid:string, edge:string}} palette
 * @returns {{canvas:HTMLCanvasElement, half:number, refR:number}}
 */
function _makeField(palette) {
  const { canvas, ctx: g, cx, cy } = _makeCanvas(FIELD_HALF);
  const R = FIELD_HALF * .95;
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0,   palette.mid  + '55');
  grad.addColorStop(.3,  palette.edge + '40');
  grad.addColorStop(.65, palette.edge + '22');
  grad.addColorStop(1,   palette.edge + '00');
  g.fillStyle = grad; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI*2); g.fill();
  g.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 12; i++) {
    const bx = cx + (Math.random() - .5) * R;
    const by = cy + (Math.random() - .5) * R;
    const r  = R * (.2 + Math.random() * .35);
    const gw = g.createRadialGradient(bx, by, 0, bx, by, r);
    const c  = i % 2 === 0 ? palette.core : palette.mid;
    gw.addColorStop(0, c + '20');
    gw.addColorStop(1, c + '00');
    g.fillStyle = gw; g.beginPath(); g.arc(bx, by, r, 0, Math.PI*2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  return { canvas, half: FIELD_HALF, refR: FIELD_HALF * .25 };
}

/**
 * 取得 MBTI 類型的 sprite 三件組（dot, blob, field）。
 * 結果會快取，重複請求不會重建。
 * @param {string} mbti
 * @returns {{dot:Object, blob:Object, field:Object}}
 */
export function getSpriteSet(mbti) {
  if (spriteSetCache.has(mbti)) return spriteSetCache.get(mbti);
  const color   = MBTI_COLORS[mbti];
  const palette = MBTI_PALETTES[mbti] || { core: color, mid: color, edge: color };
  const set = { dot: _makeDot(color), blob: _makeBlob(palette), field: _makeField(palette) };
  spriteSetCache.set(mbti, set);
  return set;
}

/**
 * 為非 MBTI 的 ambient 顆粒建立 dot sprite（fallback）。
 * @param {string} color
 */
export function getDotSprite(color) {
  const key = '__dot_' + color;
  if (spriteSetCache.has(key)) return spriteSetCache.get(key);
  const dot = _makeDot(color);
  const set = { dot, blob: dot, field: dot };
  spriteSetCache.set(key, set);
  return set;
}

/**
 * 預熱所有 sprite（在啟動時呼叫以避免使用時卡頓）
 */
export function prewarmAll() {
  MBTI_ORDER.forEach(m => getSpriteSet(m));
  AMBIENT_COLS.forEach(c => getDotSprite(c));
}
