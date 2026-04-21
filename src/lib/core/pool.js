/*
  pool.js
  說明：管理整個粒子池的建立、配額及回收邏輯。
  - 匯出 `particles` 與 `mbtiParticles` 作為全域狀態引用
  - 提供 spawn、prune 與 seedAmbient 等工具
*/
import { Particle } from './particle.js';
import { AMBIENT_COLS } from './constants.js';
import { getDotSprite } from './sprites.js';

/** 所有存在中的粒子清單 */
export const particles = [];
/** 依 MBTI 分類的粒子索引 */
export const mbtiParticles = {};
export const MAX_MBTI_TOTAL = 800; export const MIN_PER_TYPE = 20; export const MAX_PER_TYPE = 120; export const SPAWN_PER_JOIN = 12;

/**
 * 計算指定 MBTI 類型的配額
 * @param {string} mbti
 * @param {Object} mbtiCounts - 各 MBTI 的人數計數物件
 * @returns {number}
 */
export function quotaForType(mbti, mbtiCounts) {
  const total = Object.values(mbtiCounts).reduce((a, b) => a + b, 0) || 1;
  const count = mbtiCounts[mbti] || 1;
  const raw   = Math.floor((count / total) * MAX_MBTI_TOTAL);
  return Math.max(MIN_PER_TYPE, Math.min(MAX_PER_TYPE, raw));
}

/**
 * 裁剪過多的指定 MBTI 顆粒（移除最舊）
 * @param {string} mbti
 * @param {Object} mbtiCounts
 */
export function pruneType(mbti, mbtiCounts) {
  const arr = mbtiParticles[mbti]; if (!arr) return;
  const quota = quotaForType(mbti, mbtiCounts);
  while (arr.length > quota) { const p = arr.shift(); const idx = particles.indexOf(p); if (idx !== -1) particles.splice(idx, 1); }
}

/**
 * 比對所有類型並裁剪至配額
 */
export function pruneAllTypes(mbtiCounts) { for (const mbti of Object.keys(mbtiParticles)) pruneType(mbti, mbtiCounts); }

/**
 * 當有人加入某 MBTI 時，從畫面中心噴發一批新顆粒
 * @param {string} mbti
 * @param {string} color
 * @param {number} W
 * @param {number} H
 * @param {Object} mbtiCounts
 */
export function spawnMBTI(mbti, color, W = (typeof window !== 'undefined' ? window.innerWidth : 800), H = (typeof window !== 'undefined' ? window.innerHeight : 600), mbtiCounts = {}) {
  if (!mbtiParticles[mbti]) mbtiParticles[mbti] = [];
  const bx = W / 2, by = H / 2;
  for (let i = 0; i < SPAWN_PER_JOIN; i++) { const p = new Particle(bx, by, color, mbti); p.vx = (Math.random() - .5) * 40; p.vy = (Math.random() - .5) * 40; particles.push(p); mbtiParticles[mbti].push(p); }
  pruneAllTypes(mbtiCounts);
}

/**
 * 產生 ambient（背景）顆粒，這些顆粒不會被 MBTI 配額裁剪
 * @param {number} n
 * @param {number} W
 * @param {number} H
 */
export function seedAmbient(n, W = (typeof window !== 'undefined' ? window.innerWidth : 800), H = (typeof window !== 'undefined' ? window.innerHeight : 600)) {
  for (let i = 0; i < n; i++) {
    const col = AMBIENT_COLS[i % AMBIENT_COLS.length];
    const p   = new Particle(Math.random()*W, Math.random()*H, col, null);
    if (i < 3) { p.sizeClass = 'blob'; p.size = 14 + Math.random() * 18; p.alphaT = Math.random() * .08 + .04; p._sprites = getDotSprite(col); }
    else { p.sizeClass = 'dot'; p.size = Math.random() * 4 + 1.5; p.alphaT = Math.random() * .15 + .05; }
    particles.push(p);
  }
}
