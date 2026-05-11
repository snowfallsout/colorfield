/*
 * src/lib/states/display.svelte.ts
 * Purpose: Canonical display state owner for the display overlay and session panel.
 */
import type {
	DisplayStatePayload,
	SessionCounts,
	SessionRecord,
	SessionResetPayload,
	SessionSummary,
	SpawnParticlesPayload
} from '$lib/shared/contracts';
import { MBTI_COLORS, MBTI_ORDER } from '$lib/shared/constants/mbti';
import type { DisplayLegendRow, DisplaySessionCountRow, DisplayState } from '$lib/types/display';

function createDefaultLegendRows(): DisplayLegendRow[] {
	return MBTI_ORDER.map((label) => ({
		color: MBTI_COLORS[label],
		label,
		fillPercent: 0,
		count: 0,
		active: false,
		top: false
	}));
}

function totalFromCounts(counts: SessionCounts): number {
	return Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0);
}

function createSelectedCountRows(selected: SessionRecord | null): DisplaySessionCountRow[] {
	if (!selected) {
		return [];
	}

	return Object.entries(selected.counts)
		.sort((left, right) => right[1] - left[1])
		.map(([label, count]) => ({
			label,
			count
		}));
}

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
		emptyLabel: 'No participants yet',
		glowColor: 'transparent',
		rows: createDefaultLegendRows()
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
		qrHintLines: ['在活动管理中', '设置局域网 IP'],
		sessionFallbackLabel: '— InkLumina Session —'
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
		selectedCountRows: [],
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
	sessionName: '',
	sessionLabel: '',
	counts: {},
	total: 0,
	waitingVisible: true
};

export const displayState = $state(defaultState);

function updateSessionLabel(): void {
	displayState.sessionLabel = displayState.sessionName ? `— ${displayState.sessionName} —` : '';
}

function createSessionRecord(record: SessionRecord): SessionRecord {
	return {
		...record,
		counts: { ...record.counts }
	};
}

export function setLegendCounts(counts: SessionCounts, total = totalFromCounts(counts)): void {
	const normalizedCounts = { ...counts };
	const normalizedTotal = total;
	let topLabel = '';
	let topCount = 0;

	const nextRows = createDefaultLegendRows().map((row) => {
		const count = normalizedCounts[row.label] ?? 0;
		if (count > topCount) {
			topCount = count;
			topLabel = row.label;
		}

		return {
			...row,
			count,
			fillPercent: normalizedTotal > 0 ? (count / normalizedTotal) * 100 : 0,
			active: count > 0,
			top: false
		};
	});

	displayState.counts = normalizedCounts;
	displayState.total = normalizedTotal;
	displayState.waitingVisible = normalizedTotal < 1;
	displayState.footer.participantCount = normalizedTotal;
	displayState.legend.rows = nextRows.map((row) => ({
		...row,
		top: topCount > 0 && row.label === topLabel
	}));
	displayState.legend.glowColor =
		displayState.legend.rows.find((row) => row.top)?.color ?? 'transparent';
}

export function openSessionPanel(): void {
	displayState.sessionPanel.open = true;
	displayState.sessionPanel.error = '';
}

export function closeSessionPanel(): void {
	displayState.sessionPanel.open = false;
	setSelectedSession(null);
	displayState.sessionPanel.error = '';
}

export function setSessionName(sessionName: string): void {
	displayState.sessionName = sessionName.trim();
	updateSessionLabel();
}

export function setSessionDraftName(draftName: string): void {
	displayState.sessionPanel.draftName = draftName;
}

export function setSessionHostInput(hostInput: string): void {
	displayState.sessionPanel.hostInput = hostInput;
}

export function setSessionPanelLoading(loading: boolean): void {
	displayState.sessionPanel.loading = loading;
}

export function setSessionPanelSaving(saving: boolean): void {
	displayState.sessionPanel.saving = saving;
}

export function setSessionPanelError(error: string): void {
	displayState.sessionPanel.error = error;
}

export function setSessionHistory(history: SessionSummary[]): void {
	displayState.sessionPanel.history = history.map((item) => ({ ...item }));
}

export function setSelectedSession(selected: SessionRecord | null): void {
	const nextSelected = selected ? createSessionRecord(selected) : null;
	displayState.sessionPanel.selected = nextSelected;
	displayState.sessionPanel.selectedCountRows = createSelectedCountRows(nextSelected);
}

export function setJoinQr(joinUrl: string, joinQrDataUrl: string): void {
	displayState.sessionPanel.joinUrl = joinUrl;
	displayState.sessionPanel.joinQrDataUrl = joinQrDataUrl;
}

export function resetDisplayOverview(): void {
	setSessionName('');
	setLegendCounts({}, 0);
	setSelectedSession(null);
}

export function applySocketState(payload: DisplayStatePayload): void {
	if (payload.session) {
		setSessionName(payload.session.name);
	}

	if (payload.counts || payload.total !== undefined) {
		const counts = payload.counts ?? displayState.counts;
		setLegendCounts(counts, payload.total ?? totalFromCounts(counts));
	}
}

export function applySpawnParticles(payload: SpawnParticlesPayload): void {
	if (payload.session) {
		setSessionName(payload.session.name);
	}

	if (payload.counts || payload.total !== undefined) {
		const counts = payload.counts ?? displayState.counts;
		setLegendCounts(counts, payload.total ?? totalFromCounts(counts));
	}
}

export function applySessionReset(payload: SessionResetPayload): void {
	setSessionName(payload.session.name);
	setLegendCounts(payload.counts ?? {}, totalFromCounts(payload.counts ?? {}));
	displayState.sessionPanel.draftName = '';
	setSelectedSession(null);
}
