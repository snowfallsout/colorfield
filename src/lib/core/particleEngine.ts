/**
 * particleEngine.ts
 *
 * A synchronous, reasonably compact particle engine used by DisplayCanvas.
 * Responsibilities:
 *  - Manage a pool of particles and MBTI-type groupings
 *  - Provide spawn and spawnMBTI APIs
 *  - Support simple physics (attraction to interaction points)
 *  - Render sprites using the spriteCache module
 *
 * Notation:
 *  - All coordinates inside the engine are in PIXEL space (canvas coords).
 *  - Interaction points are passed in pixel coords by the DisplayCanvas
 *    after converting from normalized stores.
 */

// Core particle engine for the display canvas. Implementation details
// are documented inside the class methods per project docstring convention.

import { getDot } from './spriteCache';
import type { InteractionPoint } from './interactionGrid';

type TrailPoint = { x: number; y: number; s: number };

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number; color: string;
  age: number;
  trail: TrailPoint[];
  myTrailMax: number;
  mbti?: string | null;
};

export class ParticleEngine {
  particles: Particle[] = [];
  width = 0; height = 0;
  max = 1200;
  interactionPoints: InteractionPoint[] = [];

  // MBTI grouping (mbti -> Particle[])
  mbtiParticles: Record<string, Particle[]> = {};

  constructor(opts?: { max?: number }) {
    /*
      constructor(opts)
      - Initialize particle engine state and optional maximum particle limit.
      - `opts.max` (optional): cap on total particle count to bound memory/cpu.
    */
    if (opts?.max) this.max = opts.max;
  }

  resize(w: number, h: number) {
    /*
      resize(w, h)
      - Update engine pixel dimensions so particle wrapping and spawn
      calculations match the canvas size.
    */
    this.width = w; this.height = h;
  }

  seedAmbient(n = 20) {
    /*
      seedAmbient(n)
      - Create `n` low-priority ambient particles scattered across the canvas
      - Useful to populate the scene before interactions begin.
    */
    for (let i = 0; i < n; i++) {
      this.spawnParticle(Math.random() * this.width, Math.random() * this.height, '#8888cc');
    }
  }

  spawnParticle(x: number, y: number, color = '#ffffff', mbti: string | null = null) {
    /*
      spawnParticle(x, y, color, mbti)
      - Create a single particle at pixel coords (x,y) with a randomized
      velocity, size and trail capacity. If an `mbti` string is provided,
      the particle is added to the MBTI grouping map for quota-based pruning.
    */
    if (this.particles.length >= this.max) return;
    const p: Particle = {
      x, y,
      vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
      size: 6 + Math.random()*18,
      alpha: 0.6 + Math.random()*0.4,
      color,
      age: 0,
      trail: [],
      myTrailMax: Math.floor(Math.random() * 12) + 4,
      mbti,
    };
    this.particles.push(p);
    if (mbti) {
      if (!this.mbtiParticles[mbti]) this.mbtiParticles[mbti] = [];
      this.mbtiParticles[mbti].push(p);
    }
  }

  /**
   * Spawn MBTI burst. `counts` is optional (used to compute quotas if provided).
   */
  spawnMBTI(mbti: string, color?: string, counts?: Record<string, number>) {
    /*
      spawnMBTI(mbti, color, counts)
      - Create a short burst of particles for the given `mbti` type. This is
      typically invoked when a user with an MBTI joins. If `counts` is
      provided, `pruneAllTypes` is called to rebalance per-type quotas.
    */
    const SPAWN_PER_JOIN = 18;
    const bx = this.width / 2, by = this.height / 2;
    for (let i = 0; i < SPAWN_PER_JOIN; i++) {
      const p = {
        x: bx + (Math.random()-0.5) * 40,
        y: by + (Math.random()-0.5) * 40,
        vx: (Math.random()-0.5) * 40,
        vy: (Math.random()-0.5) * 40,
        size: 6 + Math.random()*22,
        alpha: 0.6 + Math.random()*0.4,
        color: color || '#ffffff',
        age: 0,
        trail: [],
        myTrailMax: Math.floor(Math.random() * 12) + 4,
        mbti,
      } as Particle;
      if (this.particles.length < this.max) {
        this.particles.push(p);
        if (!this.mbtiParticles[mbti]) this.mbtiParticles[mbti] = [];
        this.mbtiParticles[mbti].push(p);
      }
    }
    // After spawning, prune by quotas if counts provided
    if (counts) this.pruneAllTypes(counts);
  }

  setInteractions(points: InteractionPoint[]) {
    /*
      setInteractions(points)
      - Replace the engine's interaction points with the provided array.
      - `points` are expected in PIXEL space.
    */
    this.interactionPoints = points;
  }

  /**
   * Simple quota calculation: given counts mapping, compute a per-type
   * quota and prune oldest particles to respect those quotas.
   */
  pruneAllTypes(counts?: Record<string, number>) {
    /*
      pruneAllTypes(counts)
      - Compute per-MBTI quotas and remove oldest particles to enforce limits.
      - If `counts` is omitted, a safe per-type max is applied.
    */
    const MAX_MBTI_TOTAL = 800;
    const MIN_PER_TYPE = 20;
    const MAX_PER_TYPE = 120;
    if (!counts) {
      // If no counts provided, enforce a naive max-per-type
      for (const k of Object.keys(this.mbtiParticles)) {
        const arr = this.mbtiParticles[k];
        while (arr.length > MAX_PER_TYPE) {
          const p = arr.shift();
          const idx = this.particles.indexOf(p!);
          if (idx !== -1) this.particles.splice(idx, 1);
        }
      }
      return;
    }
    const total = Object.values(counts).reduce((a,b) => a+b, 0) || 1;
    for (const mbti of Object.keys(this.mbtiParticles)) {
      const count = counts[mbti] || 1;
      const raw = Math.floor((count / total) * MAX_MBTI_TOTAL);
      const quota = Math.max(MIN_PER_TYPE, Math.min(MAX_PER_TYPE, raw));
      const arr = this.mbtiParticles[mbti];
      while (arr.length > quota) {
        const p = arr.shift();
        const idx = this.particles.indexOf(p!);
        if (idx !== -1) this.particles.splice(idx, 1);
      }
    }
  }

  step(dt: number) {
    /*
      step(dt)
      - Advance physics for all particles by `dt` milliseconds.
      - Updates velocities, applies attraction from interaction points,
      updates trails, applies damping, and wraps particles across bounds.
    */
    // dt in ms. Update particle physics and trails.
    for (const p of this.particles) {
      p.age += dt;
      // trail update (store coarse positions)
      if (p.age % 2 === 0) {
        p.trail.push({ x: p.x, y: p.y, s: p.size });
        if (p.trail.length > p.myTrailMax) p.trail.splice(0, p.trail.length - p.myTrailMax);
      }

      // attraction from all interaction points (naive sum)
      if (this.interactionPoints.length) {
        let ax = 0, ay = 0;
        for (const it of this.interactionPoints) {
          const dx = it.x - p.x; const dy = it.y - p.y; const d2 = dx*dx+dy*dy + 1;
          const f = (it.score || 1) * 2000 / d2;
          ax += dx * f; ay += dy * f;
        }
        p.vx += ax * 0.0005; p.vy += ay * 0.0005;
      }
      p.vx *= 0.995; p.vy *= 0.995;
      p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06;
      // wrap
      if (p.x < -50) p.x = this.width + 10;
      if (p.x > this.width + 50) p.x = -10;
      if (p.y < -50) p.y = this.height + 10;
      if (p.y > this.height + 50) p.y = -10;
    }
    // prune oldest if beyond max
    if (this.particles.length > this.max) this.particles.splice(0, this.particles.length - this.max);
  }

  drawDiamondSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
    /*
      drawDiamondSparkle(ctx, x, y, size, alpha)
      - Helper for rendering a transient sparkle around a particle.
      - Uses randomized stroke and fill for visual variety.
    */
    const s = size * (2.5 + Math.random() * 2);
    const d = s * .22;
    ctx.globalAlpha = alpha * (.3 + Math.random() * .4);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = .6;
    ctx.beginPath();
    ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
    ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d);
    ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d);
    ctx.stroke();
    ctx.globalAlpha = alpha * .6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, .8, 0, Math.PI*2); ctx.fill();
  }

  render(ctx: CanvasRenderingContext2D) {
    /*
      render(ctx)
      - Draw current particle state into the provided 2D canvas context.
      - Renders trails, core sprites and occasional sparkles.
    */
    for (const p of this.particles) {
      // draw trail
      for (let i = 1; i < p.trail.length; i++) {
        const t = i / p.trail.length;
        const pt = p.trail[i];
        const spr = getDot(p.color);
        const hw = (pt.s / 64) * (spr.width/2) * t * .7;
        if (hw < .5) continue;
        ctx.globalAlpha = t * p.alpha * .45;
        ctx.drawImage(spr, pt.x - hw, pt.y - hw, hw*2, hw*2);
      }
      // core sprite
      const spr = getDot(p.color);
      const hw = (p.size/64) * (spr.width/2);
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(spr, p.x - hw, p.y - hw, hw*2, hw*2);

      // sparkles
      if (Math.random() < .06) this.drawDiamondSparkle(ctx, p.x, p.y, p.size, p.alpha);
    }
    ctx.globalAlpha = 1;
  }
}

export default ParticleEngine;
