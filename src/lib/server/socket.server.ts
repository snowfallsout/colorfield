/*
 * src/lib/server/socket.server.ts
 * Purpose: Production-facing Socket.IO attach helper for Node-based runtime entrypoints.
 */
import { Server as IOServer } from 'socket.io';
import type http from 'http';
import type { ClientToServerEvents, ServerToClientEvents } from '../shared/contracts.js';
import { registerSocketServer } from './socket.shared.js';

/**
 * attachSocket(server)
 * - Call this from your Node server entry after `svelte-kit build` when
 *   running the built app with adapter-node. The function attaches a
 *   Socket.IO server to the provided `http.Server`.
 */
export function attachSocket(server: http.Server) {
  const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' }
  });
  registerSocketServer(io);

  return io;
}
