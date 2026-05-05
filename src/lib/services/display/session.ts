/*
 * src/lib/services/display/session.ts
 * Purpose: Canonical display-service module for session panel actions, REST loading, and QR rendering.
 */
import { get } from 'svelte/store';
import type {
	DeleteSessionResponse,
	SessionMutationResponse,
	SessionRecord,
	SessionsOverviewResponse
} from '$lib/shared/contracts';
import { displayState } from '$lib/state/display.svelte';
import { buildJoinUrl, sanitizeHost, SESSION_HOST_STORAGE_KEY } from '$lib/utils/session';

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

function escapeHtml(value: string): string {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function setLegacySessionName(name: string): void {
	const element = document.getElementById('session-name');
	if (!element) return;
	element.textContent = name ? `— ${name} —` : '';
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
		script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
		script.async = true;
		script.dataset.joinQr = '1';
		script.addEventListener('load', finalize, { once: true });
		script.addEventListener('error', fail, { once: true });
		document.head.appendChild(script);
	});

	return qrCodeLoader;
}

export function restoreSavedIp(): void {
	if (typeof window === 'undefined') return;
	const saved = window.localStorage.getItem(SESSION_HOST_STORAGE_KEY) ?? '';
	if (!saved) return;
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (input) input.value = saved;
	displayState.setSessionHostInput(saved);
}

export async function regenerateJoinQr(): Promise<void> {
	if (typeof window === 'undefined') return;
	const current = get(displayState).sessionPanel.hostInput.trim();
	if (!current) {
		displayState.setJoinQr('', '');
		return;
	}

	const host = sanitizeHost(current);
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		displayState.setSessionPanelError('IP 格式不正确，示例：192.168.0.68 或 192.168.0.68:3000');
		return;
	}

	const joinUrl = buildJoinUrl(current);
	let joinQrDataUrl = '';
	try {
		joinQrDataUrl = await buildQrDataUrl(joinUrl, 220);
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'QR code generation failed');
		return;
	}

	window.localStorage.setItem(SESSION_HOST_STORAGE_KEY, current);
	displayState.setSessionPanelError('');
	displayState.setJoinQr(joinUrl, joinQrDataUrl);
}

export async function loadSessionOverview(): Promise<void> {
	displayState.setSessionPanelLoading(true);
	displayState.setSessionPanelError('');

	try {
		const response = await fetch('/api/sessions');
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionsOverviewResponse;
		displayState.setSessionHistory(payload.history ?? []);
		displayState.setSessionName(payload.active?.name ? `— ${payload.active.name} —` : '');
		if (payload.active) {
			displayState.applySocketState({
				counts: payload.active.counts,
				colors: {},
				total: payload.active.total,
				session: payload.active
			});
		}
		if (payload.active?.name) {
			displayState.setSelectedSession(payload.active);
		}
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to load sessions');
	} finally {
		displayState.setSessionPanelLoading(false);
	}
}

export async function createDisplaySession(): Promise<void> {
	const { draftName } = get(displayState).sessionPanel;
	displayState.setSessionPanelSaving(true);
	displayState.setSessionPanelError('');

	try {
		const response = await fetch('/api/sessions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: draftName })
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionMutationResponse;
		displayState.setSessionDraftName('');
		displayState.applySessionReset({ session: payload.active });
		await loadSessionOverview();
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to create session');
	} finally {
		displayState.setSessionPanelSaving(false);
	}
}

export async function viewDisplaySession(id: string): Promise<void> {
	displayState.setSessionPanelError('');

	try {
		const response = await fetch(`/api/sessions/${id}`);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionRecord;
		displayState.setSelectedSession(payload);
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to load session detail');
	}
}

export async function deleteDisplaySession(id: string): Promise<void> {
	displayState.setSessionPanelError('');

	try {
		const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		await response.json() as DeleteSessionResponse;
		await loadSessionOverview();
		const currentSelected = get(displayState).sessionPanel.selected;
		if (currentSelected?.id === id) {
			displayState.setSelectedSession(null);
		}
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to delete session');
	}
}

export function openSessionPanel(): void {
	const panel = document.getElementById('session-panel');
	panel?.classList.add('open');
	void loadSessionHistory();
}

export function closeSessionPanel(): void {
	document.getElementById('session-panel')?.classList.remove('open');
}

export async function loadSessionHistory(): Promise<void> {
	const response = await fetch('/api/sessions');
	const payload = (await response.json()) as SessionsOverviewResponse;
	const list = document.getElementById('sp-history-list');
	if (!list) return;
	if (payload.active) {
		setLegacySessionName(payload.active.name);
	}
	if (!payload.history || payload.history.length === 0) {
		list.innerHTML = '<div style="color:rgba(30,40,60,0.3);font-size:12px;padding:16px 0">暂无历史记录</div>';
		return;
	}
	list.innerHTML = payload.history
		.map((session) => {
			const date = new Date(session.createdAt);
			const dateString = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			return `
			<div class="sp-row">
				<div class="sp-row-info">
					<div class="sp-row-name">${escapeHtml(session.name)}</div>
					<div class="sp-row-meta">${dateString} · ${session.total} 人参与</div>
				</div>
				<button class="sp-btn" data-session-action="view" data-session-id="${session.id}">查看</button>
				<button class="sp-btn danger" data-session-action="delete" data-session-id="${session.id}">删除</button>
			</div>`;
		})
		.join('');
}

export async function createNewSession(): Promise<void> {
	const nameInput = document.getElementById('sp-name-input') as HTMLInputElement | null;
	const name = nameInput?.value.trim() ?? '';
	if (!window.confirm(`开始新场次"${name || '新活动'}"？当前数据将存入历史记录。`)) return;
	const response = await fetch('/api/sessions/new', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name })
	});
	const payload = (await response.json()) as SessionMutationResponse;
	if (payload.ok) {
		if (nameInput) nameInput.value = '';
		const ipInput = document.getElementById('sp-ip-input') as HTMLInputElement | null;
		if (ipInput && ipInput.value.trim()) {
			await generateJoinQr();
		} else {
			closeSessionPanel();
		}
	}
}

export async function viewSession(id: string): Promise<void> {
	const response = await fetch(`/api/sessions/${id}`);
	const session = (await response.json()) as SessionRecord;
	const lines = Object.entries(session.counts ?? {})
		.sort((left, right) => right[1] - left[1])
		.map(([mbti, count]) => `${mbti}: ${count}人`)
		.join('\n');
	window.alert(`${session.name}\n创建: ${new Date(session.createdAt).toLocaleString()}\n总人数: ${session.total}\n\n${lines || '无数据'}`);
}

export async function deleteSession(id: string, button: HTMLButtonElement): Promise<void> {
	if (!window.confirm('确认删除此历史记录？')) return;
	const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
	const payload = (await response.json()) as DeleteSessionResponse;
	if (payload.ok) {
		button.closest('.sp-row')?.remove();
	}
}

export async function generateJoinQr(): Promise<void> {
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (!input) return;
	const raw = input.value.trim();
	if (!raw) {
		window.alert('请先填写 PC 的局域网 IPv4 地址（ipconfig → WLAN 适配器 IPv4 Address）');
		return;
	}

	const host = sanitizeHost(raw);
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		window.alert('IP 格式看起来不对，示例：192.168.0.68  或  192.168.0.68:3000');
		return;
	}
	const url = buildJoinUrl(raw);
	window.localStorage.setItem(SESSION_HOST_STORAGE_KEY, raw);

	const wrap = document.getElementById('sp-qr-wrap');
	const qrBox = document.getElementById('sp-qr');
	if (!wrap || !qrBox) return;
	let joinQrDataUrl = '';
	try {
		joinQrDataUrl = await buildQrDataUrl(url, 180);
	} catch (error) {
		window.alert(error instanceof Error ? error.message : 'QR code generation failed');
		return;
	}
	qrBox.innerHTML = `<img alt="Session join QR code" src="${joinQrDataUrl}" />`;
	const urlElement = document.getElementById('sp-qr-url');
	if (urlElement) urlElement.textContent = url;
	wrap.style.display = 'block';
	void refreshCornerQr();
}

export async function refreshCornerQr(): Promise<void> {
	const box = document.getElementById('corner-qr');
	const urlElement = document.getElementById('corner-qr-url');
	const hint = document.getElementById('corner-qr-hint');
	if (!box) return;
	const raw = window.localStorage.getItem(SESSION_HOST_STORAGE_KEY);
	if (!raw) {
		box.innerHTML = '';
		if (urlElement) urlElement.textContent = '';
		if (hint) hint.style.display = '';
		return;
	}

	const url = buildJoinUrl(raw);
	box.innerHTML = '';
	if (hint) hint.style.display = 'none';
	let joinQrDataUrl = '';
	try {
		joinQrDataUrl = await buildQrDataUrl(url, 120);
	} catch (error) {
		console.warn('Failed to refresh corner QR:', error);
		if (hint) hint.style.display = '';
		return;
	}
	box.innerHTML = `<img alt="Corner QR code" src="${joinQrDataUrl}" />`;
	if (urlElement) urlElement.textContent = url;
}