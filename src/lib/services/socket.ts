/*
 * src/lib/services/socket.ts
 * Purpose: Shared socket client owner for creating one client connection and exposing typed emit/on helpers.
 */
import { browser } from '$app/environment';
import { publicConfig } from '$lib/config/public';
import { createSocket, type Socket } from '$lib/services/socket-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from '$lib/shared/contracts';

let socket: Socket | null = null;

function safeEmit<EventName extends keyof ClientToServerEvents>(
  event: EventName,
  payload: Parameters<ClientToServerEvents[EventName]>[0]
) {
  if (!socket) return;
  try {
    (socket.emit as (eventName: EventName, eventPayload: Parameters<ClientToServerEvents[EventName]>[0]) => void)(event, payload);
  } catch (error) {
    void error;
  }
}

export function connect(opts?: { url?: string }): Socket | null {
  if (!browser) return null;
  if (socket) return socket;

  const url = opts?.url ?? publicConfig.socketUrl;

  try {
    socket = createSocket(url);
    return socket;
  } catch (error) {
    console.warn('socket.io client not available:', error);
    return null;
  }
}

export function emit<EventName extends keyof ClientToServerEvents>(
  event: EventName,
  payload: Parameters<ClientToServerEvents[EventName]>[0]
) {
  safeEmit(event, payload);
}

export function disconnect() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function on<EventName extends keyof ServerToClientEvents>(
  event: EventName,
  cb: ServerToClientEvents[EventName]
) {
  if (!socket) return;
  try {
    (socket.on as (eventName: EventName, listener: ServerToClientEvents[EventName]) => void)(event, cb);
  } catch (error) {
    void error;
  }
}
