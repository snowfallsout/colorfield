/*
	particleEngine.ts
	說明：提供 display canvas 使用的粒子引擎相容 API，實際委派給目前
	的粒子 utility 與 display 相鄰模組，避免元件直接耦合到底層實作。
*/

import { prewarmAll } from './sprite';
import { seedAmbient as seedDisplayAmbient, spawnMBTI as spawnDisplayMBTI, state } from './core';
import type { RuntimeFacePoint, RuntimeParticle } from './types';

export type ParticleFace = { x: number; y: number; smile?: boolean };
export type ParticleInteraction = { x: number; y: number; score?: number };

type ParticleEngineOptions = {
	max?: number;
};

function detachParticle(particle: RuntimeParticle) {
	for (const list of Object.values(state.mbtiParticles) as RuntimeParticle[][]) {
		const index = list.indexOf(particle);
		if (index !== -1) {
			list.splice(index, 1);
		}
	}
}

export default class ParticleEngine {
	private readonly max: number;

	constructor(options: ParticleEngineOptions = {}) {
		/*
		  建立粒子引擎相容實例。
		  @param options - 舊版 Canvas 元件傳入的設定，現在只使用 `max`。
		*/
		this.max = options.max ?? 1200;
		if (typeof document !== 'undefined') {
			prewarmAll();
		}
	}

	resize(width: number, height: number) {
		// 更新粒子系統使用的畫布尺寸，供 spawn 與 update 計算使用。
		state.W = width;
		state.H = height;
	}

	setFaces(faces: ParticleFace[]) {
		// 接收目前偵測到的人臉座標，並推導整體情緒狀態。
		state.faces = Array.isArray(faces)
			? faces.map((face) => ({ x: face.x, y: face.y, smile: Boolean(face.smile) }))
			: [];
		state.emotion = state.faces.some((face) => face?.smile) ? 'smile' : 'neutral';
	}

	setInteractions(interactions: ParticleInteraction[]) {
		// 接收手勢/互動點資料，讓粒子 update 時可使用同一份 pixel-space 座標。
		state.activePinchPoints = Array.isArray(interactions)
			? interactions.map((interaction) => ({ x: interaction.x, y: interaction.y }))
			: [];
	}

	seedAmbient(count: number) {
		// 補種背景粒子，沿用現行 pool 實作。
		seedDisplayAmbient(count);
		this.trimOverflow();
	}

	spawnMBTI(mbti: string, color?: string, _counts: Record<string, number> = {}) {
		// 建立 MBTI 粒子並套用現行 quota/prune 行為。
		spawnDisplayMBTI(mbti, color ?? '#ffffff');
		this.trimOverflow();
	}

	step(_deltaMs: number) {
		// 驅動所有粒子的物理更新；delta 目前沿用 legacy 固定步進，不直接使用。
		for (const particle of state.particles) {
			particle.update(state.faces, state.emotion);
		}
		this.trimOverflow();
	}

	render(ctx: CanvasRenderingContext2D) {
		// 將目前粒子狀態繪製到 canvas context。
		for (const particle of state.particles) {
			particle.draw(ctx);
		}
	}

	get particles() {
		return state.particles;
	}

	private trimOverflow() {
		while (state.particles.length > this.max) {
			const particle = state.particles.shift();
			if (!particle) {
				break;
			}
			detachParticle(particle);
		}
	}
}