/*
 * src/routes/api/control/+server.ts
 * Purpose: Read and update the persisted control-panel profile used by display, mobile, and control routes.
 */
import { error, json } from '@sveltejs/kit';
import { requireOperatorToken } from '$lib/server/operator-auth.server';
import { getControlProfile, saveControlProfile } from '$lib/server/control.server';
import type { ControlSavePayload } from '$lib/types/control';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({ profile: getControlProfile() });
};

export const PUT: RequestHandler = async ({ request }) => {
	const authError = requireOperatorToken(request);
	if (authError) {
		return authError;
	}

	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload !== 'object' || !('profile' in payload)) {
		throw error(400, 'Invalid control payload');
	}

	const profile = saveControlProfile(payload as ControlSavePayload);
	return json({ ok: true, profile });
};