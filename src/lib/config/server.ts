/*
 * src/lib/config/server.ts
 * Purpose: Resolve server-only integration config for filesystem-backed session
 * persistence without mixing deployment concerns into runtime tuning modules.
 */
import path from 'node:path';
import { env } from '$env/dynamic/private';

export type ServerConfig = {
	sessionsDir: string;
	sessionFilePrefix: string;
	defaultSessionName: string;
};

function normalizeOptionalValue(value: string | undefined): string | undefined {
	const normalized = value?.trim();
	return normalized ? normalized : undefined;
}

function resolveSessionsDir(value: string | undefined): string {
	const normalized = normalizeOptionalValue(value);
	return normalized ? path.resolve(normalized) : path.join(process.cwd(), 'data', 'sessions');
}

export const serverConfig: ServerConfig = {
	sessionsDir: resolveSessionsDir(env.INKLUMINA_SESSIONS_DIR),
	sessionFilePrefix: 'session_',
	defaultSessionName: 'InkLumina Session'
};

export default serverConfig;