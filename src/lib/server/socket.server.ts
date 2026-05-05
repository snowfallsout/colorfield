import { Server as IOServer } from 'socket.io';
import type http from 'http';
import type { ColorfieldClientToServerEvents, ColorfieldServerToClientEvents } from '$lib/shared/contracts';
import { registerColorfieldSocketServer } from '$lib/server/socket.shared';

/**
 * attachSocket(server)
 * - Call this from your Node server entry after `svelte-kit build` when
 *   running the built app with adapter-node. The function attaches a
 *   Socket.IO server to the provided `http.Server`.
 */
export function attachSocket(server: http.Server) {
  const io = new IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents>(server, {
    cors: { origin: '*' }
  });
  registerColorfieldSocketServer(io);

  return io;
}
