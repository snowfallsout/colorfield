/*
 * src/routes/api/sessions/[id]/+server.ts
 * Purpose: REST endpoints for session detail lookup and history deletion.
 */
import { error, json } from '@sveltejs/kit';
import { requireOperatorToken } from '$lib/server/operator-auth.server';
import { deleteHistoryById, findHistoryById } from '$lib/server/sessions.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const record = findHistoryById(params.id);
  if (!record) {
    throw error(404, 'Session not found');
  }

  return json(record);
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  const authError = requireOperatorToken(request);
  if (authError) {
    return authError;
  }

  const ok = deleteHistoryById(params.id);
  if (!ok) {
    throw error(404, 'Session not found');
  }

  return json({ ok: true });
};