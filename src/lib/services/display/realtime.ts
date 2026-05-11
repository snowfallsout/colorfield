/*
 * src/lib/services/display/realtime.ts
 * Purpose: Canonical display-service owner for binding shared socket events into display-specific state and queues.
 */
import type {
	DisplayStatePayload,
	LuckyColorPayload,
	SessionResetPayload,
	SpawnParticlesPayload
} from '$lib/shared/contracts';
import { MBTI_PALETTES } from '$lib/shared/constants/mbti';
import { connect, on } from '$lib/services/socket';
import { pushSpawn } from '$lib/states/particles.svelte';
import { showToast } from '$lib/states/ui.svelte';
import { applySessionReset, applySocketState, applySpawnParticles } from '$lib/states/display.svelte';
import { registerDisplayLegacyBridge, startDisplayLegacyRuntime, syncLegacyBridge } from '$lib/services/legacy';

let realtimeBound = false;

function resolveSpawnColor(payload: SpawnParticlesPayload): string | undefined {
	const mbtiKey = (payload.mbti || '').toUpperCase();
	const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
	return payload.color ?? palette?.mid ?? palette?.core;
}

export function bindRealtimeSocket(): void {
	if (realtimeBound) {
		return;
	}

	const socket = connect();
	if (!socket) {
		return;
	}

	realtimeBound = true;

	on('state', (payload: DisplayStatePayload) => {
		applySocketState(payload);
	});

	on('spawn_particles', (payload: SpawnParticlesPayload) => {
		const mbti = (payload.mbti || '').toUpperCase();
		pushSpawn({
			mbti,
			color: resolveSpawnColor(payload),
			nickname: payload.nickname ?? undefined,
			counts: payload.counts,
			total: payload.total
		});
		applySpawnParticles(payload);
		showToast(`✦ ${mbti} ${payload.nickname || ''} joined`, payload.color || '#ffffff');
	});

	on('session_reset', (payload: SessionResetPayload) => {
		applySessionReset(payload);
		showToast('✦ 新场次已开始', '#ffffff');
	});

	on('lucky_color', (_payload: LuckyColorPayload) => {
		// display does not currently render the lucky-color payload directly.
	});
}

export { syncLegacyBridge, registerDisplayLegacyBridge, startDisplayLegacyRuntime };