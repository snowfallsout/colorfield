/*
 * src/lib/settings/display.ts
 * Purpose: Centralize display-facing runtime tuning values such as palette,
 * particle physics, and canvas defaults.
 */
import type { DisplaySettings } from '../types';

export const displaySettings: DisplaySettings = {
	colors: {
		background: '#0b1020',
		primary: '#7dd3fc',
		accent: '#f472b6',
		particle: '#fffb8f',
		hand: '#34d399',
		uiMuted: '#94a3b8'
	},
	physics: {
		gravity: 0.0,
		drag: 0.05,
		particleMass: 1.0,
		particleSizeRange: [1.5, 6.0],
		spawnRate: 30,
		maxParticles: 1200,
		attractionStrength: 0.6,
		repulsionStrength: 0.8,
		timeStep: 1 / 60
	},
	canvas: {
		pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
		clearColor: '#FFFFFF'
	}
};

export default displaySettings;