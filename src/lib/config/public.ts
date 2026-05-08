/*
 * src/lib/config/public.ts
 * Purpose: Resolve deployment-facing public environment variables for
 * browser-safe consumers without mixing them into runtime tuning settings.
 */
import { env } from '$env/dynamic/public';

export type PublicConfig = {
	socketUrl?: string;
};

function normalizeOptionalValue(value: string): string | undefined {
	/*
	 * Normalize optional public env values so empty strings behave the same as
	 * an unset variable when browser services choose their connection target.
	 */
	const normalized = value.trim();
	return normalized ? normalized : undefined;
}

export const publicConfig: PublicConfig = {
	socketUrl: normalizeOptionalValue(env.PUBLIC_SOCKET_URL ?? '')
};

export default publicConfig;