/*
 * src/lib/types/display.ts
 * Purpose: Central display-domain types shared by display state, services, and UI components.
 */
import type { SessionCounts, SessionRecord, SessionSummary } from '$lib/shared/contracts';

export type DisplayLegendRow = {
	color: string;
	label: string;
	fillPercent: number;
	count: number;
	active: boolean;
	top: boolean;
};

export type DisplayHeaderModel = {
	title: string;
	subtitle: string;
	emotionBadge: string;
	cameraToggleOff: string;
	cameraToggleOn: string;
	handBadge: string;
};

export type DisplayLegendModel = {
	title: string;
	emptyLabel: string;
	glowColor: string;
	rows: DisplayLegendRow[];
};

export type DisplayHintsModel = {
	interaction: string;
	waiting: string;
};

export type DisplaySessionControlsModel = {
	buttonLabel: string;
};

export type DisplayFooterModel = {
	participantsLabel: string;
	participantCount: number;
	scanToJoinLabel: string;
	qrHintLines: [string, string];
	sessionFallbackLabel: string;
};

export type DisplaySessionPanelCopy = {
	closeLabel: string;
	title: string;
	newSessionPlaceholder: string;
	newSessionButtonLabel: string;
	ipPlaceholder: string;
	generateQrButtonLabel: string;
	qrHint: string;
	historyTitle: string;
	emptyHistory: string;
};

export type DisplaySessionPanelState = DisplaySessionPanelCopy & {
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
	header: DisplayHeaderModel;
	legend: DisplayLegendModel;
	hints: DisplayHintsModel;
	sessionControls: DisplaySessionControlsModel;
	footer: DisplayFooterModel;
	sessionPanel: DisplaySessionPanelState;
	sessionName: string;
	sessionLabel: string;
	counts: SessionCounts;
	total: number;
	waitingVisible: boolean;
};