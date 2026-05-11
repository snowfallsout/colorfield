/*
 * src/lib/services/display/session.ts
 * Purpose: Canonical display-service module for session panel actions, REST loading, and QR rendering.
 */
import type {
	ApiErrorResponse,
	DeleteSessionResponse,
	SessionMutationResponse,
	SessionRecord,
	SessionsOverviewResponse
} from '$lib/shared/contracts';
import { sessionConfig, sessionDetailPath } from '$lib/config/session';
import {
	applySessionReset,
	applySocketState,
	displayState,
	openSessionPanel,
	resetDisplayOverview,
	setJoinQr,
	setSelectedSession,
	setSessionDraftName,
	setSessionHistory,
	setSessionHostInput,
	setSessionPanelError,
	setSessionPanelLoading,
	setSessionPanelSaving
} from '$lib/states/display.svelte';

function sanitizeHost(raw: string): string {
	return raw.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

function buildJoinUrl(raw: string): string {
	const host = sanitizeHost(raw);
	const withPort =
		host.includes(':') || typeof window === 'undefined' || !window.location.port
			? host
			: `${host}:${window.location.port}`;
	return `http://${withPort}${sessionConfig.routes.mobileJoin}`;
}

type QRCodeOptions = {
	text: string;
	width: number;
	height: number;
	colorDark: string;
	colorLight: string;
	correctLevel: number;
};

type QRCodeConstructor = {
	new (element: HTMLElement, options: QRCodeOptions): unknown;
	CorrectLevel: {
		M: number;
	};
};

declare global {
	interface Window {
		QRCode?: QRCodeConstructor;
	}
}

let qrCodeLoader: Promise<QRCodeConstructor> | null = null;

function loadSavedOperatorToken(): string {
	if (typeof window === 'undefined') return '';
	return window.localStorage.getItem(sessionConfig.storage.operatorTokenKey)?.trim() ?? '';
}

function saveOperatorToken(token: string): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(sessionConfig.storage.operatorTokenKey, token);
}

function clearOperatorToken(): void {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(sessionConfig.storage.operatorTokenKey);
}

export function readSavedDisplayHost(): string {
	if (typeof window === 'undefined') return '';
	return window.localStorage.getItem(sessionConfig.storage.displayHostKey)?.trim() ?? '';
}

function saveDisplayHost(value: string): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(sessionConfig.storage.displayHostKey, value);
}

function ensureOperatorToken(): string {
	const saved = loadSavedOperatorToken();
	if (saved) {
		return saved;
	}

	if (typeof window === 'undefined') {
		return '';
	}

	const token = window.prompt('请输入 operator token 以管理场次。')?.trim() ?? '';
	if (token) {
		saveOperatorToken(token);
	}
	return token;
}

function createOperatorHeaders(headers?: HeadersInit): Headers {
	const next = new Headers(headers);
	const token = ensureOperatorToken();
	if (token) {
		next.set(sessionConfig.headers.operatorToken, token);
	}
	return next;
}

async function readApiError(response: Response, fallbackMessage: string): Promise<string> {
	try {
		const payload = (await response.json()) as Partial<ApiErrorResponse>;
		if (typeof payload.error === 'string' && payload.error.trim()) {
			return payload.error;
		}
	} catch (error) {
		void error;
	}

	return fallbackMessage;
}

async function fetchOperatorAction(input: string, init: RequestInit, missingTokenMessage: string): Promise<Response> {
	const headers = createOperatorHeaders(init.headers);
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

async function buildQrDataUrl(url: string, size: number): Promise<string> {
	if (typeof window === 'undefined') {
		throw new Error('QR code generation requires a browser environment');
	}

	const QRCode = await ensureQrCodeLibrary();
	const mount = document.createElement('div');
	mount.style.position = 'fixed';
	mount.style.left = '-9999px';
	mount.style.top = '-9999px';
	mount.style.pointerEvents = 'none';
	document.body.appendChild(mount);

	try {
		new QRCode(mount, {
			text: url,
			width: size,
			height: size,
			colorDark: '#000',
			colorLight: '#fff',
			correctLevel: QRCode.CorrectLevel.M
		});

		await new Promise<void>((resolve) => {
			window.requestAnimationFrame(() => resolve());
		});

		const canvas = mount.querySelector('canvas');
		if (canvas instanceof HTMLCanvasElement) {
			return canvas.toDataURL('image/png');
		}

		const image = mount.querySelector('img');
		if (image instanceof HTMLImageElement && image.src) {
			return image.src;
		}

		throw new Error('QR code render failed');
	} finally {
		mount.remove();
	}
}

function ensureQrCodeLibrary(): Promise<QRCodeConstructor> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('QR code generation requires a browser environment'));
	}

	if (window.QRCode) {
		return Promise.resolve(window.QRCode);
	}

	if (qrCodeLoader) {
		return qrCodeLoader;
	}

	qrCodeLoader = new Promise<QRCodeConstructor>((resolve, reject) => {
		const existing = document.querySelector('script[data-join-qr="1"]') as HTMLScriptElement | null;

		const finalize = () => {
			if (window.QRCode) {
				resolve(window.QRCode);
				return;
			}
			reject(new Error('QRCode constructor not found on window'));
		};

		const fail = () => reject(new Error('Failed to load qrcodejs library'));

		if (existing) {
			existing.addEventListener('load', finalize, { once: true });
			existing.addEventListener('error', fail, { once: true });
			return;
		}

		const script = document.createElement('script');
		script.src = sessionConfig.assets.qrScriptUrl;
		script.async = true;
		script.dataset.joinQr = '1';
		script.addEventListener('load', finalize, { once: true });
		script.addEventListener('error', fail, { once: true });
		document.head.appendChild(script);
	});

	return qrCodeLoader;
}

export async function openDisplaySessionPanel(): Promise<void> {
	openSessionPanel();
	await loadSessionOverview();
}

export async function regenerateJoinQr(): Promise<void> {
	if (typeof window === 'undefined') return;
	const current = displayState.sessionPanel.hostInput.trim();
	if (!current) {
		setJoinQr('', '');
		return;
	}

	const host = sanitizeHost(current);
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		setSessionPanelError('IP 格式不正确，示例：192.168.0.68 或 192.168.0.68:3000');
		return;
	}

	const joinUrl = buildJoinUrl(current);
	let joinQrDataUrl = '';
	try {
		joinQrDataUrl = await buildQrDataUrl(joinUrl, 220);
	} catch (error) {
		setSessionPanelError(error instanceof Error ? error.message : 'QR code generation failed');
		return;
	}

	saveDisplayHost(current);
	setSessionPanelError('');
	setJoinQr(joinUrl, joinQrDataUrl);
}

export async function loadSessionOverview(): Promise<void> {
	setSessionPanelLoading(true);
	setSessionPanelError('');

	try {
		const response = await fetch(sessionConfig.routes.collection);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionsOverviewResponse;
		setSessionHistory(payload.history ?? []);
		if (payload.active) {
			applySocketState({
				counts: payload.active.counts,
				colors: {},
				total: payload.active.total,
				session: payload.active
			});
			setSelectedSession(payload.active);
		} else {
			resetDisplayOverview();
		}
	} catch (error) {
		setSessionPanelError(error instanceof Error ? error.message : 'Failed to load sessions');
	} finally {
		setSessionPanelLoading(false);
	}
}

export async function createDisplaySession(): Promise<void> {
	const { draftName } = displayState.sessionPanel;
	setSessionPanelSaving(true);
	setSessionPanelError('');

	try {
		const response = await fetchOperatorAction(
			sessionConfig.routes.collection,
			{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: draftName })
			},
			'Operator token is required to create a session.'
		);
		if (!response.ok) {
			throw new Error(await readApiError(response, `HTTP ${response.status}`));
		}
		const payload = (await response.json()) as SessionMutationResponse;
		setSessionDraftName('');
		applySessionReset({ session: payload.active, counts: payload.active.counts });
		await loadSessionOverview();
	} catch (error) {
		setSessionPanelError(error instanceof Error ? error.message : 'Failed to create session');
	} finally {
		setSessionPanelSaving(false);
	}
}

export async function viewDisplaySession(id: string): Promise<void> {
	setSessionPanelError('');

	try {
		const response = await fetch(sessionDetailPath(id));
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionRecord;
		setSelectedSession(payload);
	} catch (error) {
		setSessionPanelError(error instanceof Error ? error.message : 'Failed to load session detail');
	}
}

export async function deleteDisplaySession(id: string): Promise<void> {
	setSessionPanelError('');

	try {
		const response = await fetchOperatorAction(
			sessionDetailPath(id),
			{ method: 'DELETE' },
			'Operator token is required to delete a session.'
		);
		if (!response.ok) {
			throw new Error(await readApiError(response, `HTTP ${response.status}`));
		}
		await response.json() as DeleteSessionResponse;
		await loadSessionOverview();
		const currentSelected = displayState.sessionPanel.selected;
		if (currentSelected?.id === id) {
			setSelectedSession(null);
		}
	} catch (error) {
		setSessionPanelError(error instanceof Error ? error.message : 'Failed to delete session');
	}
}
