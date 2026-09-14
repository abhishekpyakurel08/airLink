"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketGateway = setupWebSocketGateway;
const ws_1 = __importStar(require("ws"));
const Command_1 = require("../models/Command");
const activeSockets = new Map(); // deviceId -> ClientSocket
const pairedSessions = new Map();
function setupWebSocketGateway(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    // Heartbeat ping interval
    const pingInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.send(JSON.stringify({ type: 'PING' }));
        });
    }, 15000);
    wss.on('close', () => clearInterval(pingInterval));
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('message', async (raw) => {
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
                    }
                    else {
                        session.extensionId = msg.deviceId;
                    }
                    ws.send(JSON.stringify({ type: 'AUTH_RESPONSE', success: true }));
                    return;
                }
                // Relay command to paired peer
                relayMessageToPeer(ws, msg);
                // Audit non-sensitive commands to MongoDB (skipping raw mousemove and keystrokes for security)
                if (msg.type !== 'MOUSE_MOVE' && msg.type !== 'KEY_TYPE' && ws.sessionId && ws.deviceId) {
                    Command_1.Command.create({
                        session_id: ws.sessionId,
                        device_id: ws.deviceId,
                        type: msg.type,
                        payload: msg
                    }).catch((err) => console.error('[Command Audit Log Error]', err));
                }
            }
            catch (err) {
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
function relayMessageToPeer(sender, msg) {
    if (!sender.sessionId)
        return;
    const session = pairedSessions.get(sender.sessionId);
    if (!session)
        return;
    const targetDeviceId = sender.role === 'PHONE' ? session.extensionId : session.phoneId;
    if (!targetDeviceId)
        return;
    const targetSocket = activeSockets.get(targetDeviceId);
    if (targetSocket && targetSocket.readyState === ws_1.default.OPEN) {
        targetSocket.send(JSON.stringify(msg));
    }
}
