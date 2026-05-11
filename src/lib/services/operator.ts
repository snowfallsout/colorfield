/*
 * src/lib/services/operator.ts
 * Purpose: Canonical browser-side operator-token owner shared by control and session mutation services.
 */
import { sessionConfig } from '$lib/config/session';

function readSavedOperatorToken(): string {
	if (typeof window === 'undefined') return '';
	return window.localStorage.getItem(sessionConfig.storage.operatorTokenKey)?.trim() ?? '';
}

function saveOperatorToken(token: string): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(sessionConfig.storage.operatorTokenKey, token);
}

export function clearOperatorToken(): void {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(sessionConfig.storage.operatorTokenKey);
}

export function ensureOperatorToken(promptMessage = '请输入 operator token 以管理场次。'): string {
	const saved = readSavedOperatorToken();
	if (saved) {
		return saved;
	}

	if (typeof window === 'undefined') {
		return '';
	}

	const token = window.prompt(promptMessage)?.trim() ?? '';
	if (token) {
		saveOperatorToken(token);
	}
	return token;
}

export function createOperatorHeaders(headers?: HeadersInit, promptMessage?: string): Headers {
	const next = new Headers(headers);
	const token = ensureOperatorToken(promptMessage);
	if (token) {
		next.set(sessionConfig.headers.operatorToken, token);
	}
	return next;
}

export async function fetchOperatorAction(
	input: string,
	init: RequestInit,
	missingTokenMessage: string,
	promptMessage?: string
): Promise<Response> {
	const headers = createOperatorHeaders(init.headers, promptMessage);
	if (!headers.get(sessionConfig.headers.operatorToken)) {
		return Promise.reject(new Error(missingTokenMessage));
	}

	const response = await fetch(input, {
		...init,
		headers
	});

	if (response.status === 401 || response.status === 403) {
		clearOperatorToken();
	}

	return response;
}