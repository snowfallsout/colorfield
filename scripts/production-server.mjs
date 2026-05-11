/*
 * scripts/production-server.mjs
 * Purpose: Start the built SvelteKit handler behind a custom Node HTTP server
 * so Socket.IO shares the same production entrypoint as the HTTP app.
 */
import { createServer } from 'node:http';
import process from 'node:process';
import { handler } from '../build/handler.js';
import { attachSocket } from '../build/socket/server/socket.server.js';

function resolveHost() {
	return process.env.HOST || '0.0.0.0';
}

function resolvePort() {
	const parsed = Number.parseInt(process.env.PORT || '3000', 10);
	return Number.isFinite(parsed) ? parsed : 3000;
}

function resolveOrigin(host, port) {
	if (process.env.ORIGIN) return process.env.ORIGIN;
	const printableHost = host === '0.0.0.0' ? '127.0.0.1' : host;
	return `http://${printableHost}:${port}`;
}

function resolveShutdownTimeoutMs() {
	const parsed = Number.parseInt(process.env.SHUTDOWN_TIMEOUT || '30', 10);
	return (Number.isFinite(parsed) ? parsed : 30) * 1000;
}

function shutdown(signal, server, closeSocketServer) {
	console.log(`Stopping InkLumina (${signal})...`);
	closeSocketServer();
	server.close((error) => {
		if (error) {
			console.error('Failed to close HTTP server cleanly:', error);
			process.exit(1);
		}
		process.exit(0);
	});

	setTimeout(() => {
		server.closeAllConnections?.();
		process.exit(1);
	}, resolveShutdownTimeoutMs()).unref();
}

const host = resolveHost();
const port = resolvePort();
const origin = resolveOrigin(host, port);
const server = createServer(handler);
const io = attachSocket(server);

server.listen(port, host, () => {
	console.log(`Starting InkLumina on ${origin}`);
});

process.on('SIGINT', () => shutdown('SIGINT', server, () => io.close()));
process.on('SIGTERM', () => shutdown('SIGTERM', server, () => io.close()));