/*
 * src/hooks.server.ts
 * Purpose: Ensure persisted control-profile overrides are loaded before request handling.
 */
import type { Handle } from '@sveltejs/kit';
import { ensureControlProfileLoaded } from '$lib/server/control.server';

export const handle: Handle = async ({ event, resolve }) => {
	ensureControlProfileLoaded();
	return resolve(event);
};
