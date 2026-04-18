// Shared type declarations for config/settings

export type ColorPalette = {
	background: string;
	primary: string;
	accent: string;
	particle: string;
	hand: string;
	uiMuted: string;
};

export type PhysicsSettings = {
	gravity: number; // global gravity strength (px/s^2)
	drag: number; // linear drag coefficient (0..1)
	particleMass: number; // base particle mass
	particleSizeRange: [number, number]; // min, max radius in px
	spawnRate: number; // particles per second
	maxParticles: number; // hard cap
	attractionStrength: number; // attraction to points / hands
	repulsionStrength: number; // repulsion between particles
	timeStep: number; // simulation timestep (s)
};

export type MediapipeSettings = {
	handConfidenceThreshold: number; // 0..1
	faceConfidenceThreshold: number; // 0..1
	smoothing: number; // smoothing factor for landmark streams
};

export type CanvasSettings = {
	width?: number; // optional override
	height?: number; // optional override
	pixelRatio?: number; // device pixel ratio multiplier
	clearColor?: string; // canvas clear color
};

export type Settings = {
	colors: ColorPalette;
	physics: PhysicsSettings;
	mediapipe: MediapipeSettings;
	canvas: CanvasSettings;
	socket: {
		url?: string;
		reconnectIntervalMs: number;
	};
};

