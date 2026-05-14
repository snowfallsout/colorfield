/*
 * src/lib/types/media.ts
 * Purpose: Central media-domain types shared by state owners and browser inference services.
 */
export type CrowdMember = {
	id?: string;
	x: number;
	y: number;
	size?: number;
	conf?: number;
	smile?: boolean;
	ts?: number;
};

export type InteractionPoint = {
	id?: string;
	x: number;
	y: number;
	score?: number;
	ts?: number;
};