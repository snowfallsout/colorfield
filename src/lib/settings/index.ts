/*
 * src/lib/settings/index.ts
 * Purpose: Canonical barrel for runtime tunables grouped by domain.
 */
import type { AppSettings } from '../types';
import { controlSettings } from './control';
import { displaySettings } from './display';
import { networkSettings } from './network';
import { visionSettings } from './vision';

export const settings: AppSettings = {
	display: displaySettings,
	vision: visionSettings,
	network: networkSettings
};

export { controlSettings, displaySettings, networkSettings, visionSettings };

export default settings;