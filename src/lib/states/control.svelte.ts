/*
 * src/lib/states/control.svelte.ts
 * Purpose: Canonical control-panel state owner for the control route UI.
 */
import { cloneControlProfile, snapshotControlProfile } from '$lib/services/control.shared';
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

export function resetControlDraft(): void {
	controlState.profile = snapshotControlProfile();
	controlState.replaceOperatorToken = '';
	controlState.error = '';
	controlState.status = '';
}