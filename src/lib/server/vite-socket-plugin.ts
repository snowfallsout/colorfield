import { Server as IOServer } from 'socket.io';
import type { Plugin } from 'vite';
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from '../shared/contracts';
import { registerSocketServer } from './socket.shared';

export default function socketIOPlugin(): Plugin {
  let io: IOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

  return {
    name: 'vite-plugin-socket-io',
    configureServer(server) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      // Attach Socket.IO to Vite's HTTP server in dev only
      io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
        cors: { origin: '*' }
      });
      registerSocketServer(io);

      // Close socket when Vite stops
      httpServer.on('close', () => {
        try { io?.close(); } catch (error) { void error; }
      });
    }
  };
}
