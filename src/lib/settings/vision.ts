/*
 * src/lib/settings/vision.ts
 * Purpose: Centralize camera and MediaPipe tuning values used by shared media
 * state, generic browser inference, and the display runtime.
 */
import type { VisionSettings } from '../types';

const baseHandsModelComplexity: 0 | 1 = 1;
const baseTopNHands = 2;

export const visionSettings: VisionSettings = {
	video: {
		width: 640,
		height: 480
	},
	base: {
		handsModelComplexity: baseHandsModelComplexity,
		maxCrowd: 6,
		topNHands: baseTopNHands,
		minProcessingHz: 20,
		handConfidenceThreshold: 0.6,
		faceConfidenceThreshold: 0.6,
		smoothing: 0.75
	},
	media: {
		crowdCap: 30,
		activeCap: 8,
		cameraLoadingMinMs: 900
	},
	display: {
		maxFaces: 6,
		maxHands: baseTopNHands,
		faceDetectionConfidence: 0.5,
		faceTrackingConfidence: 0.5,
		handDetectionConfidence: 0.7,
		handTrackingConfidence: 0.6,
		handsModelComplexity: baseHandsModelComplexity
	}
};

export default visionSettings;