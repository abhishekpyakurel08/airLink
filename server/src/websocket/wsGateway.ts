import { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Command } from '../models/Command';

interface ClientSocket extends WebSocket {
  isAlive?: boolean;
  deviceId?: string;
  sessionId?: string;
  role?: 'PHONE' | 'BROWSER';
}

const activeSockets = new Map<string, ClientSocket>(); // deviceId -> ClientSocket
const pairedSessions = new Map<string, { phoneId?: string; extensionId?: string }>();

export function setupWebSocketGateway(server: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat ping interval
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: ClientSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.send(JSON.stringify({ type: 'PING' }));
    });
  }, 15000);

  wss.on('close', () => clearInterval(pingInterval));

  wss.on('connection', (ws: ClientSocket) => {
    ws.isAlive = true;

    ws.on('message', async (raw: any) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Handle Heartbeat PONG
        if (msg.type === 'PONG') {
          ws.isAlive = true;
          return;
        }

        // Auth & Connection registration
        if (msg.type === 'AUTH_REQUEST') {
          ws.deviceId = msg.deviceId;
          ws.sessionId = msg.sessionId;
          ws.role = msg.role;

          if (msg.deviceId) {
            activeSockets.set(msg.deviceId, ws);
          }

          let session = pairedSessions.get(msg.sessionId);
          if (!session) {
            session = {};
            pairedSessions.set(msg.sessionId, session);
          }

          if (msg.role === 'PHONE') {
            session.phoneId = msg.deviceId;
          } else {
            session.extensionId = msg.deviceId;
          }

          ws.send(JSON.stringify({ type: 'AUTH_RESPONSE', success: true }));
          return;
        }

        // Relay command to paired peer
        relayMessageToPeer(ws, msg);

        // Audit non-sensitive commands to MongoDB (skipping raw mousemove and keystrokes for security)
        if (msg.type !== 'MOUSE_MOVE' && msg.type !== 'KEY_TYPE' && ws.sessionId && ws.deviceId) {
          Command.create({
            session_id: ws.sessionId,
            device_id: ws.deviceId,
            type: msg.type,
            payload: msg
          }).catch((err: any) => console.error('[Command Audit Log Error]', err));
        }
      } catch (err: any) {
        console.error('[WS Gateway Message Error]', err);
      }
    });

    ws.on('close', () => {
      if (ws.deviceId) {
        activeSockets.delete(ws.deviceId);
      }
    });
  });

  return wss;
}

function relayMessageToPeer(sender: ClientSocket, msg: any) {
  if (!sender.sessionId) return;
  const session = pairedSessions.get(sender.sessionId);
  if (!session) return;

  const targetDeviceId = sender.role === 'PHONE' ? session.extensionId : session.phoneId;
  if (!targetDeviceId) return;

  const targetSocket = activeSockets.get(targetDeviceId);
  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify(msg));
  }
}
