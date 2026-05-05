import { Server as IOServer } from 'socket.io';
import type { Plugin } from 'vite';
import type {
  ColorfieldClientToServerEvents,
  ColorfieldServerToClientEvents
} from '../shared/contracts';
import { registerColorfieldSocketServer } from './socket.shared';

export default function socketIOPlugin(): Plugin {
  let io: IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents> | null = null;

  return {
    name: 'vite-plugin-socket-io',
    configureServer(server) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      // Attach Socket.IO to Vite's HTTP server in dev only
      io = new IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents>(httpServer, {
        cors: { origin: '*' }
      });
      registerColorfieldSocketServer(io);

      // Close socket when Vite stops
      httpServer.on('close', () => {
        try { io?.close(); } catch (error) { void error; }
      });
    }
  };
}
