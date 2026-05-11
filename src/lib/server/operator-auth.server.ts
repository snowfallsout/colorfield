/*
 * src/lib/server/operator-auth.server.ts
 * Purpose: Guard operator-only session mutation endpoints with a single token-based policy.
 */
import { json } from '@sveltejs/kit';
import { sessionConfig } from '../config/session.js';
import { serverConfig } from '../config/server.js';
import type { ApiErrorResponse } from '../shared/contracts.js';

function createErrorResponse(status: number, message: string): Response {
	const payload: ApiErrorResponse = {
		ok: false,
		error: message
	};

	return json(payload, { status });
}

function readAuthorizationToken(request: Request): string {
	const authorization = request.headers.get('authorization')?.trim() ?? '';
	if (!authorization.toLowerCase().startsWith('bearer ')) {
		return '';
	}

	return authorization.slice('Bearer '.length).trim();
}

function readOperatorToken(request: Request): string {
	const directToken = request.headers.get(sessionConfig.headers.operatorToken)?.trim() ?? '';
	if (directToken) {
		return directToken;
	}

	return readAuthorizationToken(request);
}

export function requireOperatorToken(request: Request): Response | null {
	const expectedToken = serverConfig.operatorToken;
	if (!expectedToken) {
		return createErrorResponse(503, 'Operator token is not configured on the server.');
	}

	const actualToken = readOperatorToken(request);
	if (!actualToken) {
		return createErrorResponse(401, 'Operator token is required for this action.');
	}

	if (actualToken !== expectedToken) {
		return createErrorResponse(403, 'Operator token is invalid.');
	}

	return null;
}