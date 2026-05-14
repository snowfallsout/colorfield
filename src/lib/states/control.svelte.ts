/*
 * src/lib/states/control.svelte.ts
 * Purpose: Canonical control-panel state owner for the control route UI.
 */
import { cloneControlProfile, snapshotControlProfile } from '$lib/services/control.shared';
import { hydrateControlProfile, saveControlProfile as persistControlProfile } from '$lib/services/control';
import type { ControlProfile } from '$lib/types/control';

export const controlState = $state({
	loading: false,
	saving: false,
	error: '',
	status: '',
	replaceOperatorToken: '',
	profile: snapshotControlProfile() as ControlProfile
});

export function setControlLoading(loading: boolean): void {
	controlState.loading = loading;
}

export function setControlSaving(saving: boolean): void {
	controlState.saving = saving;
}

export function setControlError(error: string): void {
	controlState.error = error;
	if (error) {
		controlState.status = '';
	}
}

export function setControlStatus(status: string): void {
	controlState.status = status;
	if (status) {
		controlState.error = '';
	}
}

export function setReplaceOperatorToken(value: string): void {
	controlState.replaceOperatorToken = value;
}

export function setControlProfile(profile: ControlProfile): void {
	controlState.profile = cloneControlProfile(profile);
}

export function setControlResolution(width: number, height: number): void {
	controlState.profile.camera.width = width;
	controlState.profile.camera.height = height;
}

export function setControlHandsModelComplexity(value: 0 | 1): void {
	controlState.profile.camera.handsModelComplexity = value;
}

export async function loadControlPanel(force = false): Promise<ControlProfile> {
	setControlLoading(true);
	setControlError('');

	try {
		const profile = await hydrateControlProfile(force);
		setControlProfile(profile);
		if (force) {
			setControlStatus('已從目前 server profile 重新載入。');
		}
		return profile;
	} catch (error) {
		setControlError(error instanceof Error ? error.message : 'Failed to load control profile');
		return controlState.profile;
	} finally {
		setControlLoading(false);
	}
}

export async function saveControlPanel(): Promise<ControlProfile> {
	setControlSaving(true);
	setControlError('');

	try {
		const profile = await persistControlProfile(controlState.profile, controlState.replaceOperatorToken);
		setControlProfile(profile);
		setReplaceOperatorToken('');
		setControlStatus('控制設定已保存。部分 server 參數會在下一次 request 或重啟後完全生效。');
		return profile;
	} catch (error) {
		setControlError(error instanceof Error ? error.message : 'Failed to save control profile');
		return controlState.profile;
	} finally {
		setControlSaving(false);
	}
}

export function resetControlDraft(): void {
	controlState.profile = snapshotControlProfile();
	controlState.replaceOperatorToken = '';
	controlState.error = '';
	controlState.status = '';
}