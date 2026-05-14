/*
 * src/lib/settings/control.ts
 * Purpose: Centralize control-panel field defaults and editing metadata so control UI components render from settings instead of hard-coded parameters.
 */
import type { Palette } from '$lib/shared/constants/mbti';
import type {
	ControlCameraProfile,
	ControlDisplayProfile,
	ControlNetworkProfile,
	ControlServerProfile
} from '$lib/types/control';

type NumberFieldKey<T> = {
	[K in keyof T]-?: T[K] extends number ? K : never;
}[keyof T];

type StringFieldKey<T> = {
	[K in keyof T]-?: T[K] extends string ? K : never;
}[keyof T];

export type ControlNumberFieldConfig<T> = {
	label: string;
	key: NumberFieldKey<T>;
	min: number;
	max: number;
	step: number;
};

export type ControlTextFieldConfig<T> = {
	label: string;
	key: StringFieldKey<T>;
	placeholder?: string;
};

export type ControlSegmentedOption<T extends string | number> = {
	label: string;
	value: T;
};

export type ControlResolutionPreset = {
	label: string;
	width: number;
	height: number;
};

export type ControlPaletteFieldConfig = {
	label: string;
	key: keyof Palette;
};

export const controlComponentDefaults = {
	numberValue: 0,
	textValue: '',
	textPlaceholder: '',
	textType: 'text' as const,
	colorValue: '#FFFFFF',
	toggleChecked: false
};

export const controlSettings = {
	resolutionPresets: [
		{ label: '640 × 480', width: 640, height: 480 },
		{ label: '1080 × 720', width: 1080, height: 720 },
		{ label: '1660 × 900', width: 1660, height: 900 },
		{ label: '1920 × 1080', width: 1920, height: 1080 }
	] as ControlResolutionPreset[],
	cameraFields: [
		{ label: 'Camera Width', key: 'width', min: 160, max: 4096, step: 1 },
		{ label: 'Camera Height', key: 'height', min: 120, max: 2160, step: 1 },
		{ label: 'Max Faces', key: 'maxFaces', min: 1, max: 32, step: 1 },
		{ label: 'Max Hands', key: 'maxHands', min: 1, max: 8, step: 1 },
		{ label: 'Max Crowd', key: 'maxCrowd', min: 1, max: 64, step: 1 },
		{ label: 'Top N Hands', key: 'topNHands', min: 1, max: 8, step: 1 },
		{ label: 'Processing Hz', key: 'minProcessingHz', min: 1, max: 120, step: 1 },
		{ label: 'Camera Loading Floor', key: 'cameraLoadingMinMs', min: 0, max: 20000, step: 50 },
		{ label: 'Crowd Cap', key: 'crowdCap', min: 1, max: 128, step: 1 },
		{ label: 'Active Pinch Cap', key: 'activeCap', min: 1, max: 64, step: 1 }
	] as ControlNumberFieldConfig<ControlCameraProfile>[],
	cameraConfidenceFields: [
		{ label: 'Face Detect', key: 'faceDetectionConfidence', min: 0.05, max: 1, step: 0.01 },
		{ label: 'Face Track', key: 'faceTrackingConfidence', min: 0.05, max: 1, step: 0.01 },
		{ label: 'Hand Detect', key: 'handDetectionConfidence', min: 0.05, max: 1, step: 0.01 },
		{ label: 'Hand Track', key: 'handTrackingConfidence', min: 0.05, max: 1, step: 0.01 }
	] as ControlNumberFieldConfig<ControlCameraProfile>[],
	handsComplexityOptions: [
		{ label: 'Hands Lite', value: 0 },
		{ label: 'Hands Full', value: 1 }
	] as ControlSegmentedOption<0 | 1>[],
	displayFields: [
		{ label: 'Particle Min Size', key: 'particleSizeMin', min: 0.5, max: 64, step: 0.1 },
		{ label: 'Particle Max Size', key: 'particleSizeMax', min: 0.5, max: 128, step: 0.1 },
		{ label: 'Spawn Rate', key: 'spawnRate', min: 1, max: 240, step: 1 },
		{ label: 'Max Particles', key: 'maxParticles', min: 50, max: 20000, step: 10 },
		{ label: 'Drag', key: 'drag', min: 0, max: 1, step: 0.01 },
		{ label: 'Pixel Ratio', key: 'pixelRatio', min: 0.5, max: 4, step: 0.1 },
		{ label: 'Attraction', key: 'attractionStrength', min: 0, max: 5, step: 0.05 },
		{ label: 'Repulsion', key: 'repulsionStrength', min: 0, max: 5, step: 0.05 }
	] as ControlNumberFieldConfig<ControlDisplayProfile>[],
	networkNumberFields: [
		{ label: 'Reconnect Interval', key: 'reconnectIntervalMs', min: 250, max: 60000, step: 250 }
	] as ControlNumberFieldConfig<ControlNetworkProfile>[],
	networkTextFields: [
		{ label: 'Socket URL', key: 'socketUrl', placeholder: 'auto' },
		{ label: 'Mobile Join Path', key: 'mobileJoinPath' },
		{ label: 'QR Script URL', key: 'qrScriptUrl' }
	] as ControlTextFieldConfig<ControlNetworkProfile>[],
	serverTextFields: [
		{ label: 'Default Session Name', key: 'defaultSessionName' },
		{ label: 'Session File Prefix', key: 'sessionFilePrefix' },
		{ label: 'Sessions Directory', key: 'sessionsDir' }
	] as ControlTextFieldConfig<ControlServerProfile>[],
	paletteFields: [
		{ label: 'Core', key: 'core' },
		{ label: 'Mid', key: 'mid' },
		{ label: 'Edge', key: 'edge' }
	] as ControlPaletteFieldConfig[],
	placeholders: {
		operatorTokenConfigured: '已配置，可輸入新 token 覆蓋',
		operatorTokenMissing: '尚未配置'
	}
};

export default controlSettings;