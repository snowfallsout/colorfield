/*
 * src/lib/types/control.ts
 * Purpose: Canonical control-panel profile types shared by control UI, client services, and server persistence.
 */
import type { MBTIKey, Palette } from '$lib/shared/constants/mbti';

export type ControlCameraProfile = {
	enabled: boolean;
	width: number;
	height: number;
	maxFaces: number;
	maxHands: number;
	maxCrowd: number;
	topNHands: number;
	minProcessingHz: number;
	faceDetectionConfidence: number;
	faceTrackingConfidence: number;
	handDetectionConfidence: number;
	handTrackingConfidence: number;
	handsModelComplexity: 0 | 1;
	crowdCap: number;
	activeCap: number;
	cameraLoadingMinMs: number;
};

export type ControlDisplayProfile = {
	waterOverlay: boolean;
	particleSizeMin: number;
	particleSizeMax: number;
	spawnRate: number;
	maxParticles: number;
	drag: number;
	attractionStrength: number;
	repulsionStrength: number;
	pixelRatio: number;
	clearColor: string;
};

export type ControlNetworkProfile = {
	socketUrl: string;
	reconnectIntervalMs: number;
	mobileJoinPath: string;
	qrScriptUrl: string;
};

export type ControlServerProfile = {
	defaultSessionName: string;
	sessionFilePrefix: string;
	sessionsDir: string;
	operatorTokenDefined: boolean;
};

export type ControlMbtiProfile = {
	palettes: Record<MBTIKey, Palette>;
};

export type ControlProfile = {
	camera: ControlCameraProfile;
	display: ControlDisplayProfile;
	network: ControlNetworkProfile;
	server: ControlServerProfile;
	mbti: ControlMbtiProfile;
};

export type ControlSavePayload = {
	profile: ControlProfile;
	replaceOperatorToken?: string;
};