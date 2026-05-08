/*
 * src/lib/settings/network.ts
 * Purpose: Centralize transport-layer tuning values that apply across client
 * connections without mixing in deployment-specific environment resolution.
 */
import type { NetworkSettings } from '../types';

export const networkSettings: NetworkSettings = {
	reconnectIntervalMs: 3000
};

export default networkSettings;