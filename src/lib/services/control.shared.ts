/*
 * src/lib/services/control.shared.ts
 * Purpose: Canonical control-profile owner for snapshotting, normalizing, and applying runtime overrides across the app.
 */
import { publicConfig } from '$lib/config/public';
import { serverConfig } from '$lib/config/server';
import { sessionConfig } from '$lib/config/session';
import { displaySettings } from '$lib/settings/display';
import { networkSettings } from '$lib/settings/network';
import { visionSettings } from '$lib/settings/vision';
import { MBTI_COLORS, MBTI_ORDER, MBTI_PALETTES, type MBTIKey, type Palette } from '$lib/shared/constants/mbti';
import type { ControlProfile } from '$lib/types/control';

type Mutable<T> = {
	-readonly [K in keyof T]: T[K] extends Record<string, unknown> ? Mutable<T[K]> : T[K];
};

type MutableSessionConfig = {
	storage: {
		displayHostKey: string;
		operatorTokenKey: string;
	};
	routes: {
		collection: string;
		mobileJoin: string;
	};
	headers: {
		operatorToken: string;
	};
	assets: {
		qrScriptUrl: string;
	};
};

const controlRuntimeDefaults = {
	cameraEnabled: false,
	waterOverlay: false
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeString(value: unknown, fallback: string): string {
	return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric)) {
		return fallback;
	}
	return Math.min(max, Math.max(min, numeric));
}

function clampInteger(value: unknown, fallback: number, min: number, max: number): number {
	return Math.round(clampNumber(value, fallback, min, max));
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
	return typeof value === 'boolean' ? value : fallback;
}

function normalizeHexColor(value: unknown, fallback: string): string {
	if (typeof value !== 'string') {
		return fallback;
	}

	const normalized = value.trim();
	return /^#[0-9a-fA-F]{6}$/u.test(normalized) || /^#[0-9a-fA-F]{3}$/u.test(normalized)
		? normalized.toUpperCase()
		: fallback;
}

function normalizePath(value: unknown, fallback: string): string {
	const normalized = normalizeString(value, fallback).replace(/\s+/gu, '');
	const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
	const trimmed = withSlash.replace(/\/+$/u, '');
	return trimmed || '/';
}

function normalizeSessionFilePrefix(value: unknown, fallback: string): string {
	const normalized = normalizeString(value, fallback).replace(/[^a-zA-Z0-9_-]/gu, '_');
	return normalized || fallback;
}

function snapshotPalettes(): Record<MBTIKey, Palette> {
	return MBTI_ORDER.reduce<Record<MBTIKey, Palette>>((result, key) => {
		const palette = MBTI_PALETTES[key];
		result[key] = {
			core: palette.core,
			mid: palette.mid,
			edge: palette.edge
		};
		return result;
	}, {} as Record<MBTIKey, Palette>);
}

export function getControlRuntimeDefaults(): { cameraEnabled: boolean; waterOverlay: boolean } {
	return { ...controlRuntimeDefaults };
}

export function snapshotControlProfile(): ControlProfile {
	return {
		camera: {
			enabled: controlRuntimeDefaults.cameraEnabled,
			width: visionSettings.video.width,
			height: visionSettings.video.height,
			maxFaces: visionSettings.display.maxFaces,
			maxHands: visionSettings.display.maxHands,
			maxCrowd: visionSettings.base.maxCrowd,
			topNHands: visionSettings.base.topNHands,
			minProcessingHz: visionSettings.base.minProcessingHz,
			faceDetectionConfidence: visionSettings.display.faceDetectionConfidence,
			faceTrackingConfidence: visionSettings.display.faceTrackingConfidence,
			handDetectionConfidence: visionSettings.display.handDetectionConfidence,
			handTrackingConfidence: visionSettings.display.handTrackingConfidence,
			handsModelComplexity: visionSettings.display.handsModelComplexity,
			crowdCap: visionSettings.media.crowdCap,
			activeCap: visionSettings.media.activeCap,
			cameraLoadingMinMs: visionSettings.media.cameraLoadingMinMs
		},
		display: {
			waterOverlay: controlRuntimeDefaults.waterOverlay,
			particleSizeMin: displaySettings.physics.particleSizeRange[0],
			particleSizeMax: displaySettings.physics.particleSizeRange[1],
			spawnRate: displaySettings.physics.spawnRate,
			maxParticles: displaySettings.physics.maxParticles,
			drag: displaySettings.physics.drag,
			attractionStrength: displaySettings.physics.attractionStrength,
			repulsionStrength: displaySettings.physics.repulsionStrength,
			pixelRatio: displaySettings.canvas.pixelRatio ?? 1,
			clearColor: displaySettings.canvas.clearColor ?? '#0B1020'
		},
		network: {
			socketUrl: publicConfig.socketUrl ?? '',
			reconnectIntervalMs: networkSettings.reconnectIntervalMs,
			mobileJoinPath: sessionConfig.routes.mobileJoin,
			qrScriptUrl: sessionConfig.assets.qrScriptUrl
		},
		server: {
			defaultSessionName: serverConfig.defaultSessionName,
			sessionFilePrefix: serverConfig.sessionFilePrefix,
			sessionsDir: serverConfig.sessionsDir,
			operatorTokenDefined: !!serverConfig.operatorToken
		},
		mbti: {
			palettes: snapshotPalettes()
		}
	};
}

export function cloneControlProfile(profile: ControlProfile): ControlProfile {
	return normalizeControlProfile(profile);
}

export function normalizeControlProfile(input: unknown): ControlProfile {
	const fallback = snapshotControlProfile();
	const source = isRecord(input) ? input : {};
	const camera = isRecord(source.camera) ? source.camera : {};
	const display = isRecord(source.display) ? source.display : {};
	const network = isRecord(source.network) ? source.network : {};
	const server = isRecord(source.server) ? source.server : {};
	const mbti = isRecord(source.mbti) ? source.mbti : {};
	const palettes = isRecord(mbti.palettes) ? mbti.palettes : {};

	const particleSizeMin = clampNumber(display.particleSizeMin, fallback.display.particleSizeMin, 0.5, 64);
	const particleSizeMax = clampNumber(display.particleSizeMax, fallback.display.particleSizeMax, particleSizeMin, 128);

	const nextPalettes = MBTI_ORDER.reduce<Record<MBTIKey, Palette>>((result, key) => {
		const current = fallback.mbti.palettes[key];
		const rawPalette = isRecord(palettes[key]) ? palettes[key] : {};
		result[key] = {
			core: normalizeHexColor(rawPalette.core, current.core),
			mid: normalizeHexColor(rawPalette.mid, current.mid),
			edge: normalizeHexColor(rawPalette.edge, current.edge)
		};
		return result;
	}, {} as Record<MBTIKey, Palette>);

	return {
		camera: {
			enabled: normalizeBoolean(camera.enabled, fallback.camera.enabled),
			width: clampInteger(camera.width, fallback.camera.width, 160, 4096),
			height: clampInteger(camera.height, fallback.camera.height, 120, 2160),
			maxFaces: clampInteger(camera.maxFaces, fallback.camera.maxFaces, 1, 32),
			maxHands: clampInteger(camera.maxHands, fallback.camera.maxHands, 1, 8),
			maxCrowd: clampInteger(camera.maxCrowd, fallback.camera.maxCrowd, 1, 64),
			topNHands: clampInteger(camera.topNHands, fallback.camera.topNHands, 1, 8),
			minProcessingHz: clampInteger(camera.minProcessingHz, fallback.camera.minProcessingHz, 1, 120),
			faceDetectionConfidence: clampNumber(camera.faceDetectionConfidence, fallback.camera.faceDetectionConfidence, 0.05, 1),
			faceTrackingConfidence: clampNumber(camera.faceTrackingConfidence, fallback.camera.faceTrackingConfidence, 0.05, 1),
			handDetectionConfidence: clampNumber(camera.handDetectionConfidence, fallback.camera.handDetectionConfidence, 0.05, 1),
			handTrackingConfidence: clampNumber(camera.handTrackingConfidence, fallback.camera.handTrackingConfidence, 0.05, 1),
			handsModelComplexity: clampInteger(camera.handsModelComplexity, fallback.camera.handsModelComplexity, 0, 1) as 0 | 1,
			crowdCap: clampInteger(camera.crowdCap, fallback.camera.crowdCap, 1, 128),
			activeCap: clampInteger(camera.activeCap, fallback.camera.activeCap, 1, 64),
			cameraLoadingMinMs: clampInteger(camera.cameraLoadingMinMs, fallback.camera.cameraLoadingMinMs, 0, 20000)
		},
		display: {
			waterOverlay: normalizeBoolean(display.waterOverlay, fallback.display.waterOverlay),
			particleSizeMin,
			particleSizeMax,
			spawnRate: clampInteger(display.spawnRate, fallback.display.spawnRate, 1, 240),
			maxParticles: clampInteger(display.maxParticles, fallback.display.maxParticles, 50, 20000),
			drag: clampNumber(display.drag, fallback.display.drag, 0, 1),
			attractionStrength: clampNumber(display.attractionStrength, fallback.display.attractionStrength, 0, 5),
			repulsionStrength: clampNumber(display.repulsionStrength, fallback.display.repulsionStrength, 0, 5),
			pixelRatio: clampNumber(display.pixelRatio, fallback.display.pixelRatio, 0.5, 4),
			clearColor: normalizeHexColor(display.clearColor, fallback.display.clearColor)
		},
		network: {
			socketUrl: typeof network.socketUrl === 'string' ? network.socketUrl.trim() : fallback.network.socketUrl,
			reconnectIntervalMs: clampInteger(network.reconnectIntervalMs, fallback.network.reconnectIntervalMs, 250, 60000),
			mobileJoinPath: normalizePath(network.mobileJoinPath, fallback.network.mobileJoinPath),
			qrScriptUrl: normalizeString(network.qrScriptUrl, fallback.network.qrScriptUrl)
		},
		server: {
			defaultSessionName: normalizeString(server.defaultSessionName, fallback.server.defaultSessionName),
			sessionFilePrefix: normalizeSessionFilePrefix(server.sessionFilePrefix, fallback.server.sessionFilePrefix),
			sessionsDir: normalizeString(server.sessionsDir, fallback.server.sessionsDir),
			operatorTokenDefined: fallback.server.operatorTokenDefined
		},
		mbti: {
			palettes: nextPalettes
		}
	};
}

export function applyControlProfile(profile: ControlProfile): ControlProfile {
	const normalized = normalizeControlProfile(profile);
	const mutablePublicConfig = publicConfig as { socketUrl?: string };
	const mutableSessionConfig = sessionConfig as MutableSessionConfig;

	controlRuntimeDefaults.cameraEnabled = normalized.camera.enabled;
	controlRuntimeDefaults.waterOverlay = normalized.display.waterOverlay;

	visionSettings.video.width = normalized.camera.width;
	visionSettings.video.height = normalized.camera.height;
	visionSettings.base.maxCrowd = normalized.camera.maxCrowd;
	visionSettings.base.topNHands = normalized.camera.topNHands;
	visionSettings.base.minProcessingHz = normalized.camera.minProcessingHz;
	visionSettings.media.crowdCap = normalized.camera.crowdCap;
	visionSettings.media.activeCap = normalized.camera.activeCap;
	visionSettings.media.cameraLoadingMinMs = normalized.camera.cameraLoadingMinMs;
	visionSettings.display.maxFaces = normalized.camera.maxFaces;
	visionSettings.display.maxHands = normalized.camera.maxHands;
	visionSettings.display.faceDetectionConfidence = normalized.camera.faceDetectionConfidence;
	visionSettings.display.faceTrackingConfidence = normalized.camera.faceTrackingConfidence;
	visionSettings.display.handDetectionConfidence = normalized.camera.handDetectionConfidence;
	visionSettings.display.handTrackingConfidence = normalized.camera.handTrackingConfidence;
	visionSettings.display.handsModelComplexity = normalized.camera.handsModelComplexity;

	displaySettings.physics.particleSizeRange = [normalized.display.particleSizeMin, normalized.display.particleSizeMax];
	displaySettings.physics.spawnRate = normalized.display.spawnRate;
	displaySettings.physics.maxParticles = normalized.display.maxParticles;
	displaySettings.physics.drag = normalized.display.drag;
	displaySettings.physics.attractionStrength = normalized.display.attractionStrength;
	displaySettings.physics.repulsionStrength = normalized.display.repulsionStrength;
	displaySettings.canvas.pixelRatio = normalized.display.pixelRatio;
	displaySettings.canvas.clearColor = normalized.display.clearColor;

	networkSettings.reconnectIntervalMs = normalized.network.reconnectIntervalMs;
	mutablePublicConfig.socketUrl = normalized.network.socketUrl || undefined;
	mutableSessionConfig.routes.mobileJoin = normalized.network.mobileJoinPath;
	mutableSessionConfig.assets.qrScriptUrl = normalized.network.qrScriptUrl;

	serverConfig.defaultSessionName = normalized.server.defaultSessionName;
	serverConfig.sessionFilePrefix = normalized.server.sessionFilePrefix;
	serverConfig.sessionsDir = normalized.server.sessionsDir;

	for (const key of MBTI_ORDER) {
		const palette = normalized.mbti.palettes[key];
		MBTI_PALETTES[key] = {
			core: palette.core,
			mid: palette.mid,
			edge: palette.edge
		};
		MBTI_COLORS[key] = palette.mid;
	}

	return snapshotControlProfile();
}