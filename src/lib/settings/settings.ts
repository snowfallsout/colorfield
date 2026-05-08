/*
 * src/lib/settings/settings.ts
 * Purpose: Compatibility entry for runtime settings. New code should prefer
 * `$lib/settings` or direct domain modules such as `$lib/settings/vision`.
 */
export { settings, displaySettings, networkSettings, visionSettings } from './index';
export type { AppSettings, DisplaySettings, NetworkSettings, VisionSettings } from '../types';
export { default } from './index';
