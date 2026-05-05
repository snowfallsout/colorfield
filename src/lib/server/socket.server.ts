import { Server as IOServer } from 'socket.io';
import type http from 'http';
import type { ClientToServerEvents, ServerToClientEvents } from '$lib/shared/contracts';
import { registerSocketServer } from '$lib/server/socket.shared';

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
