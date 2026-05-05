/*
 * src/routes/api/sessions/new/+server.ts
 * Purpose: Backward-compatible session creation endpoint used by older display flows.
 */
import { json } from '@sveltejs/kit';
import { createNewSession } from '$lib/server/sessions.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.json().catch(() => ({}));
  const active = createNewSession(typeof payload?.name === 'string' ? payload.name : undefined);
  return json({ ok: true, active });
};