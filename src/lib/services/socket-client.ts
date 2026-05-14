/*
 * src/lib/services/socket-client.ts
 * Purpose: Provide the browser Socket.IO client factory used by socket-facing services.
 */
import { browser } from '$app/environment';
import { io, type Socket as IOSocket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '$lib/shared/contracts';

export type Socket = IOSocket<ServerToClientEvents, ClientToServerEvents>;

type BrowserWindowWithIO = Window & {
	io?: (url?: string) => Socket;
};

export function createSocket(url?: string): Socket {
	if (!browser) {
		throw new Error('createSocket() must run in the browser');
	}

	const globalIo = (window as BrowserWindowWithIO).io;
	if (typeof globalIo === 'function') {
		return globalIo(url);
	}

	return io(url);
}