/*
 * src/lib/server/control.server.ts
 * Purpose: Canonical server owner for persisted control-profile loading and operator-authenticated saves.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	applyControlProfile,
	normalizeControlProfile,
	resetControlServerProfile,
	setControlServerProfile,
	snapshotControlProfile
} from '$lib/services/control.shared';
import { serverConfig } from '$lib/config/server';
import type { ControlProfile, ControlSavePayload } from '$lib/types/control';

type StoredControlState = {
	profile: ControlProfile;
	operatorToken?: string;
};

const CONTROL_DIR = path.join(process.cwd(), 'data', 'control');
const CONTROL_FILE = path.join(CONTROL_DIR, 'control-profile.json');
const CONTROL_TEMP_FILE = `${CONTROL_FILE}.tmp`;

let controlLoaded = false;
let storedOperatorToken = '';

function snapshotServerProfile(): ControlProfile['server'] {
	return {
		defaultSessionName: serverConfig.defaultSessionName,
		sessionFilePrefix: serverConfig.sessionFilePrefix,
		sessionsDir: serverConfig.sessionsDir,
		operatorTokenDefined: !!serverConfig.operatorToken
	};
}

function applyServerProfile(profile: ControlProfile['server']): void {
	serverConfig.defaultSessionName = profile.defaultSessionName;
	serverConfig.sessionFilePrefix = profile.sessionFilePrefix;
	serverConfig.sessionsDir = profile.sessionsDir;
	setControlServerProfile(snapshotServerProfile());
}

function snapshotStoredProfile(): ControlProfile {
	setControlServerProfile(snapshotServerProfile());
	return snapshotControlProfile();
}

function ensureControlDir(): void {
	fs.mkdirSync(CONTROL_DIR, { recursive: true });
}

function readStoredControlState(): StoredControlState | null {
	try {
		const raw = fs.readFileSync(CONTROL_FILE, 'utf8');
		const parsed = JSON.parse(raw) as Partial<StoredControlState>;
		return {
			profile: normalizeControlProfile(parsed.profile ?? {}),
			operatorToken: typeof parsed.operatorToken === 'string' ? parsed.operatorToken.trim() : undefined
		};
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.warn('Failed to read control profile:', error);
		}
		return null;
	}
}

function persistControlState(state: StoredControlState): void {
	ensureControlDir();
	const payload = JSON.stringify(state, null, 2);

	try {
		fs.writeFileSync(CONTROL_TEMP_FILE, payload, 'utf8');
		fs.renameSync(CONTROL_TEMP_FILE, CONTROL_FILE);
	} catch (error) {
		try {
			fs.unlinkSync(CONTROL_TEMP_FILE);
		} catch (cleanupError) {
			void cleanupError;
		}
		throw error;
	}
}

export function ensureControlProfileLoaded(): void {
	if (controlLoaded) {
		return;
	}

	controlLoaded = true;
	const stored = readStoredControlState();
	if (!stored) {
		resetControlServerProfile();
		setControlServerProfile(snapshotServerProfile());
		return;
	}

	applyControlProfile(stored.profile);
	applyServerProfile(stored.profile.server);
	storedOperatorToken = stored.operatorToken ?? '';
	if (storedOperatorToken) {
		serverConfig.operatorToken = storedOperatorToken;
	}
	setControlServerProfile(snapshotServerProfile());
}

export function getControlProfile(): ControlProfile {
	ensureControlProfileLoaded();
	return snapshotStoredProfile();
}

export function saveControlProfile(payload: ControlSavePayload): ControlProfile {
	ensureControlProfileLoaded();

	const profile = applyControlProfile(payload.profile);
	applyServerProfile(profile.server);
	const nextOperatorToken = payload.replaceOperatorToken?.trim() ?? '';
	if (nextOperatorToken) {
		storedOperatorToken = nextOperatorToken;
		serverConfig.operatorToken = nextOperatorToken;
	}
	setControlServerProfile(snapshotServerProfile());
	const storedProfile = snapshotStoredProfile();

	const persistedState: StoredControlState = {
		profile: storedProfile,
		...(storedOperatorToken ? { operatorToken: storedOperatorToken } : {})
	};

	persistControlState(persistedState);
	return storedProfile;
}