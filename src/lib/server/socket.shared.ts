/*
 * src/lib/server/socket.shared.ts
 * Purpose: Shared server-side Socket.IO wiring used by both dev and production entrypoints.
 */
import type { Server as IOServer } from 'socket.io';
import { MBTI_LUCKY_PHRASES, MBTI_NAMES, MBTI_ORDER, MBTI_PALETTES } from '../shared/constants/mbti';
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	DisplayStatePayload,
	LuckyColorPayload,
	SpawnParticlesPayload
} from '../shared/contracts';
import { getActive, incrementCount } from './sessions.server';

type SocketServer = IOServer<ClientToServerEvents, ServerToClientEvents>;

function totalFromCounts(counts: Record<string, number>): number {
	return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function createStatePayload(counts: Record<string, number>): DisplayStatePayload {
	const active = getActive();
	return {
		counts,
		colors: {},
		total: totalFromCounts(counts),
		session: active
	};
}

export function registerSocketServer(io: SocketServer): void {
	const active = getActive();
	const counts: Record<string, number> = { ...(active?.counts ?? {}) };

	io.on('connection', (socket) => {
		socket.emit('mbti:init', { order: MBTI_ORDER, palettes: MBTI_PALETTES });
		socket.emit('state', createStatePayload(counts));

		socket.on('submit_mbti', (payload) => {
			const mbtiKey = (payload?.mbti || '').toUpperCase();
			const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
			const color = payload?.color || (palette ? palette.mid || palette.core : '#ffffff');
			const updated = incrementCount(mbtiKey);
			Object.keys(counts).forEach((key) => delete counts[key]);
			Object.assign(counts, updated.counts);

			const luckyPayload: LuckyColorPayload = {
				mbti: mbtiKey,
				color,
				nickname: payload?.nickname ?? MBTI_NAMES[mbtiKey as keyof typeof MBTI_NAMES] ?? null,
				luckyPhrase: MBTI_LUCKY_PHRASES[mbtiKey as keyof typeof MBTI_LUCKY_PHRASES] ?? null,
				count: counts[mbtiKey]
			};

			const spawnPayload: SpawnParticlesPayload = {
				...luckyPayload,
				counts: { ...counts },
				total: updated.total,
				session: updated.session
			};

			socket.emit('lucky_color', luckyPayload);
			io.emit('spawn_particles', spawnPayload);
		});

		socket.on('disconnect', () => {});
	});
}