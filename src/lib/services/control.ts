/*
 * src/lib/services/control.ts
 * Purpose: Canonical browser-side control service for hydrating, applying, and saving the control profile.
 */
import { setWaterOverlay } from '$lib/states/ui.svelte';
import { displayState, setLegendCounts } from '$lib/states/display.svelte';
import { clearSpriteCache, prewarmAll } from '$lib/services/display/sprite';
import { fetchOperatorAction } from '$lib/services/operator';
import {
	applyControlProfile,
	getControlRuntimeDefaults,
	normalizeControlProfile
} from '$lib/services/control.shared';
import type { ControlProfile, ControlSavePayload } from '$lib/types/control';

type ControlResponse = {
	profile: ControlProfile;
};

let hydratedProfile: ControlProfile | null = null;
let hydratePromise: Promise<ControlProfile> | null = null;

async function readApiError(response: Response, fallbackMessage: string): Promise<string> {
	try {
		const payload = (await response.json()) as Partial<{ error?: string }>;
		if (typeof payload.error === 'string' && payload.error.trim()) {
			return payload.error;
		}
	} catch (error) {
		void error;
	}

	return fallbackMessage;
}

function refreshClientVisuals(): void {
	setWaterOverlay(getControlRuntimeDefaults().waterOverlay);
	clearSpriteCache();
	if (typeof document !== 'undefined') {
		prewarmAll();
	}
	setLegendCounts(displayState.counts, displayState.total);
}

export function applyClientControlProfile(profile: ControlProfile): ControlProfile {
	const next = applyControlProfile(normalizeControlProfile(profile));
	hydratedProfile = next;
	refreshClientVisuals();
	return next;
}

export async function fetchControlProfile(): Promise<ControlProfile> {
	const response = await fetch('/api/control');
	if (!response.ok) {
		throw new Error(await readApiError(response, `HTTP ${response.status}`));
	}

	const payload = (await response.json()) as ControlResponse;
	return applyClientControlProfile(payload.profile);
}

export async function hydrateControlProfile(force = false): Promise<ControlProfile> {
	if (hydratedProfile && !force) {
		return hydratedProfile;
	}

	if (hydratePromise && !force) {
		return hydratePromise;
	}

	hydratePromise = fetchControlProfile()
		.finally(() => {
			hydratePromise = null;
		});

	return hydratePromise;
}

export function getHydratedControlProfile(): ControlProfile | null {
	return hydratedProfile;
}

export async function saveControlProfile(profile: ControlProfile, replaceOperatorToken?: string): Promise<ControlProfile> {
	const payload: ControlSavePayload = {
		profile: normalizeControlProfile(profile),
		...(replaceOperatorToken?.trim() ? { replaceOperatorToken: replaceOperatorToken.trim() } : {})
	};

	const response = await fetchOperatorAction(
		'/api/control',
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		},
		'Operator token is required to update control settings.',
		'请输入 operator token 以保存控制面板设置。'
	);

	if (!response.ok) {
		throw new Error(await readApiError(response, `HTTP ${response.status}`));
	}

	const nextPayload = (await response.json()) as { profile: ControlProfile };
	return applyClientControlProfile(nextPayload.profile);
}