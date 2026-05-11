/*
 * src/routes/api/sessions/+server.ts
 * Purpose: REST endpoints for session overview and session creation.
 */
import { json } from '@sveltejs/kit';
import { requireOperatorToken } from '$lib/server/operator-auth.server';
import { createNewSession, getActive, getHistory } from '$lib/server/sessions.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const active = getActive();
  const history = getHistory().map(({ id, name, createdAt, total }) => ({ id, name, createdAt, total }));
  return json({ active, history });
};

export const POST: RequestHandler = async ({ request }) => {
  const authError = requireOperatorToken(request);
  if (authError) {
    return authError;
  }

  const payload = await request.json().catch(() => ({}));
  const active = createNewSession(typeof payload?.name === 'string' ? payload.name : undefined);
  return json({ ok: true, active });
};