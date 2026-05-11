/*
 * src/lib/config/session.ts
 * Purpose: Centralize session-related integration constants shared by display
 * services and local browser persistence helpers.
 */

export const sessionConfig = {
	storage: {
		displayHostKey: 'display_pc_ip',
		operatorTokenKey: 'display_operator_token'
	},
	routes: {
		collection: '/api/sessions',
		mobileJoin: '/mobile'
	},
	headers: {
		operatorToken: 'x-operator-token'
	},
	assets: {
		qrScriptUrl: 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
	}
} as const;

export function sessionDetailPath(id: string): string {
	return `${sessionConfig.routes.collection}/${encodeURIComponent(id)}`;
}

export default sessionConfig;