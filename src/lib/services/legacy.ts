/*
 * src/lib/services/display/legacy.ts
 * Purpose: Canonical display-service owner for legacy window bridge helpers used by compatibility runtime paths.
 */
import { setLegendCounts, setSessionName as setDisplaySessionName } from '$lib/states/display.svelte';
import { seedAmbient } from '$lib/services/display/core';
import type { RuntimeConstructor, RuntimeDetector } from '$lib/services/display/types';

export type DisplayLegacyWindow = Window & typeof globalThis & {
	mbtiCounts?: Record<string, number>;
	renderLegend?: () => void;
	setSessionName?: (name: string) => void;
	seedAmbient?: (count: number) => void;
	_processFrame?: () => void;
	setupCamera?: () => void;
	loop?: () => void;
	__displayRuntimeStarted?: boolean;
	FaceMesh?: RuntimeConstructor<RuntimeDetector>;
	Hands?: RuntimeConstructor<RuntimeDetector>;
};

function totalFromCounts(counts: Record<string, number>): number {
	return Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0);
}

export function updateLegendFromCounts(counts: Record<string, number>): void {
// Mirror legacy legend pushes into the Svelte display state instead of direct DOM mutation.
	setLegendCounts(counts, totalFromCounts(counts));
}

export function setSessionName(name: string): void {
	setDisplaySessionName(name);
}

function attachLegacyBridge(legacyWindow: DisplayLegacyWindow): void {
	legacyWindow.renderLegend = () => {
		const counts = legacyWindow.mbtiCounts ?? {};
		updateLegendFromCounts(counts);
	};
	legacyWindow.setSessionName = (name: string) => setSessionName(name);
	legacyWindow.seedAmbient = seedAmbient;
	legacyWindow._processFrame = async () => void 0;
	legacyWindow.setupCamera = () => void 0;
	legacyWindow.loop = () => void 0;
	legacyWindow.mbtiCounts = legacyWindow.mbtiCounts ?? {};
}

export function syncLegacyBridge(): void {
	const legacyWindow = window as DisplayLegacyWindow;
	attachLegacyBridge(legacyWindow);
}

export function registerDisplayLegacyBridge(): void {
	const legacyWindow = window as DisplayLegacyWindow;
	attachLegacyBridge(legacyWindow);
}

// Kick off the legacy requestAnimationFrame/camera loop once per page lifetime.
export function startDisplayLegacyRuntime(): void {
	const legacyWindow = window as DisplayLegacyWindow;
	if (legacyWindow.__displayRuntimeStarted) {
		return;
	}
	legacyWindow.__displayRuntimeStarted = true;
	legacyWindow.seedAmbient?.(25);
	if (typeof legacyWindow._processFrame === 'function') {
		requestAnimationFrame(legacyWindow._processFrame);
	}
	legacyWindow.setupCamera?.();
	legacyWindow.loop?.();
}