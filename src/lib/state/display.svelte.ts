/*
 * src/lib/state/display.svelte.ts
 * Purpose: Canonical display state owner for the display overlay and session panel.
 */
import { writable } from 'svelte/store';
import type {
	DisplayStatePayload,
	SessionCounts,
	SessionRecord,
	SessionResetPayload,
	SessionSummary,
	SpawnParticlesPayload
} from '$lib/shared/contracts';
import { MBTI_COLORS, MBTI_ORDER } from '$lib/shared/constants/mbti';
import type { DisplayLegendRowSample, DisplaySampleData } from '$lib/utils/types';

export type DisplaySessionPanelState = DisplaySampleData['sessionPanel'] & {
	open: boolean;
	loading: boolean;
	saving: boolean;
	error: string;
	draftName: string;
	hostInput: string;
	joinUrl: string;
	joinQrDataUrl: string;
	history: SessionSummary[];
	selected: SessionRecord | null;
};

export type DisplayState = {
	header: DisplaySampleData['header'];
	legend: DisplaySampleData['legend'];
	hints: DisplaySampleData['hints'];
	sessionControls: DisplaySampleData['sessionControls'];
	footer: DisplaySampleData['footer'];
	sessionPanel: DisplaySessionPanelState;
	cameraEnabled: boolean;
	sessionName: string;
};

export type DisplayPatch = Partial<{
	header: DisplaySampleData['header'];
	legend: DisplaySampleData['legend'];
	hints: DisplaySampleData['hints'];
	sessionControls: DisplaySampleData['sessionControls'];
	footer: DisplaySampleData['footer'];
	sessionName: string;
	sessionPanel: Partial<DisplaySessionPanelState>;
}>;

function createDefaultLegendRows(): DisplayLegendRowSample[] {
	return MBTI_ORDER.map((label) => ({
		color: MBTI_COLORS[label],
		label,
		fillPercent: 0,
		count: 0
	}));
}

function withLegendCounts(
	rows: DisplayLegendRowSample[],
	counts: SessionCounts,
	total: number
): DisplayLegendRowSample[] {
	return rows.map((row) => {
		const count = counts[row.label as keyof SessionCounts] ?? 0;
		return {
			...row,
			count,
			fillPercent: total > 0 ? (count / total) * 100 : 0
		};
	});
}

const baseLegendRows = createDefaultLegendRows();

const defaultState: DisplayState = {
	header: {
		title: 'InkLumina',
		subtitle: 'MBTI · Emotion · Particle Art',
		emotionBadge: '● FACE TRACKING',
		cameraToggleOff: '◎ 摄像头 OFF',
		cameraToggleOn: '◎ 摄像头 ON',
		handBadge: '✋ HAND TRACKING INIT'
	},
	legend: {
		title: 'Present',
		rows: baseLegendRows
	},
	hints: {
		interaction: 'Try smiling · Pinch your fingers and move your hands',
		waiting: 'Waiting for participants to join...'
	},
	sessionControls: {
		buttonLabel: '⊕ 新场次 / 历史'
	},
	footer: {
		participantsLabel: 'Participants',
		participantCount: 0,
		scanToJoinLabel: 'SCAN TO JOIN',
		qrHintLines: ['在活动管理中', '设置局域网 IP']
	},
	sessionPanel: {
		open: false,
		loading: false,
		saving: false,
		error: '',
		draftName: '',
		hostInput: '',
		joinUrl: '',
		joinQrDataUrl: '',
		history: [],
		selected: null,
		closeLabel: '关闭场次管理',
		title: '活动场次管理',
		newSessionPlaceholder: '新活动名称（可留空）',
		newSessionButtonLabel: '开始新场次',
		ipPlaceholder: 'PC 局域网 IP（如 192.168.0.68）',
		generateQrButtonLabel: '生成二维码',
		qrHint: 'SCAN TO JOIN · 手机扫码加入',
		historyTitle: '历史记录',
		emptyHistory: '暂无历史记录'
	},
	cameraEnabled: false,
	sessionName: ''
};

const state = writable<DisplayState>(defaultState);

export const displayState = {
	subscribe: state.subscribe,
	set: state.set,
	update: state.update,
	patch(patch: DisplayPatch) {
		state.update((current) => ({
			...current,
			header: patch.header ?? current.header,
			legend: patch.legend ?? current.legend,
			hints: patch.hints ?? current.hints,
			sessionControls: patch.sessionControls ?? current.sessionControls,
			footer: patch.footer ?? current.footer,
			sessionName: patch.sessionName ?? current.sessionName,
			sessionPanel: patch.sessionPanel
				? {
					...current.sessionPanel,
					...patch.sessionPanel
				}
				: current.sessionPanel,
			cameraEnabled: current.cameraEnabled
		}));
	},
	toggleCamera() {
		state.update((current) => {
			const nextCameraEnabled = !current.cameraEnabled;
			const legacyToggleCamera = (window as Window & { toggleCamera?: () => void }).toggleCamera;
			if (typeof legacyToggleCamera === 'function') {
				legacyToggleCamera();
			}
			return {
				...current,
				cameraEnabled: nextCameraEnabled
			};
		});
	},
	openSessionPanel() {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				open: true,
				error: ''
			}
		}));
	},
	closeSessionPanel() {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				open: false,
				selected: null,
				error: ''
			}
		}));
	},
	setSessionName(sessionName: string) {
		state.update((current) => ({ ...current, sessionName }));
	},
	setLegendRows(rows: DisplayLegendRowSample[]) {
		state.update((current) => ({
			...current,
			legend: {
				...current.legend,
				rows
			}
		}));
	},
	setParticipantCount(participantCount: number) {
		state.update((current) => ({
			...current,
			footer: {
				...current.footer,
				participantCount
			}
		}));
	},
	setSessionDraftName(draftName: string) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				draftName
			}
		}));
	},
	setSessionHostInput(hostInput: string) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				hostInput
			}
		}));
	},
	setSessionPanelLoading(loading: boolean) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				loading
			}
		}));
	},
	setSessionPanelSaving(saving: boolean) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				saving
			}
		}));
	},
	setSessionPanelError(error: string) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				error
			}
		}));
	},
	setSessionHistory(history: SessionSummary[]) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				history
			}
		}));
	},
	setSelectedSession(selected: SessionRecord | null) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				selected
			}
		}));
	},
	setJoinQr(joinUrl: string, joinQrDataUrl: string) {
		state.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				joinUrl,
				joinQrDataUrl
			}
		}));
	},
	applySocketState(payload: DisplayStatePayload) {
		const total = payload.total ?? 0;
		state.update((current) => ({
			...current,
			sessionName: payload.session?.name ?? current.sessionName,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, payload.counts ?? {}, total)
			},
			footer: {
				...current.footer,
				participantCount: total
			}
		}));
	},
	applySpawnParticles(payload: SpawnParticlesPayload) {
		const total = payload.total ?? 0;
		state.update((current) => ({
			...current,
			sessionName: payload.session?.name ?? current.sessionName,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, payload.counts ?? {}, total)
			},
			footer: {
				...current.footer,
				participantCount: total
			}
		}));
	},
	applySessionReset(payload: SessionResetPayload) {
		state.update((current) => ({
			...current,
			sessionName: payload.session.name,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, {}, 0)
			},
			footer: {
				...current.footer,
				participantCount: 0
			},
			sessionPanel: {
				...current.sessionPanel,
				draftName: '',
				selected: null
			}
		}));
	}
};
