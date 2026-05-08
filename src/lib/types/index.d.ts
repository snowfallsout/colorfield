// Shared type declarations for runtime settings.

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

export type DisplaySettings = {
	colors: ColorPalette;
	physics: PhysicsSettings;
	canvas: CanvasSettings;
};

export type VisionVideoSettings = {
	width: number;
	height: number;
};

export type VisionBaseSettings = MediapipeSettings & {
	handsModelComplexity: 0 | 1;
	maxCrowd: number;
	topNHands: number;
	minProcessingHz: number;
};

export type VisionMediaSettings = {
	crowdCap: number;
	activeCap: number;
	cameraLoadingMinMs: number;
};

export type VisionDisplaySettings = {
	maxFaces: number;
	maxHands: number;
	faceDetectionConfidence: number;
	faceTrackingConfidence: number;
	handDetectionConfidence: number;
	handTrackingConfidence: number;
	handsModelComplexity: 0 | 1;
};

export type VisionSettings = {
	video: VisionVideoSettings;
	base: VisionBaseSettings;
	media: VisionMediaSettings;
	display: VisionDisplaySettings;
};

export type NetworkSettings = {
	reconnectIntervalMs: number;
};

export type AppSettings = {
	display: DisplaySettings;
	vision: VisionSettings;
	network: NetworkSettings;
};

