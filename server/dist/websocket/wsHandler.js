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
exports.setupWebSocketServer = setupWebSocketServer;
const ws_1 = __importStar(require("ws"));
const shared_1 = require("@airlink/shared");
const pairingService_1 = require("../services/pairingService");
const ActivityLog_1 = require("../models/ActivityLog");
// Map pairId -> PeerSession
const activeSessions = new Map();
function setupWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        let currentPairId = null;
        let currentRole = null;
        let isAuthenticated = false;
        console.log('[WebSocket] New client connected');
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                // Handle initial authentication
                if (message.type === shared_1.MessageType.AUTH_REQUEST) {
                    const authMsg = message;
                    const { pairId, deviceId, pairSecret, role } = authMsg;
                    const isValid = await pairingService_1.PairingService.validateDeviceAuth(pairId, deviceId, pairSecret, role);
                    if (!isValid) {
                        const authFail = {
                            type: shared_1.MessageType.AUTH_RESPONSE,
                            success: false,
                            message: 'Invalid pairing credentials or unauthorized device'
                        };
                        ws.send(JSON.stringify(authFail));
                        ws.close();
                        return;
                    }
                    currentPairId = pairId;
                    currentRole = role;
                    isAuthenticated = true;
                    // Register connection in activeSessions
                    let session = activeSessions.get(pairId);
                    if (!session) {
                        session = { pairId };
                        activeSessions.set(pairId, session);
                    }
                    if (role === 'extension') {
                        session.extension = { ws, deviceId };
                    }
                    else {
                        session.mobile = { ws, deviceId };
                    }
                    const peerConnected = role === 'extension' ? !!session.mobile : !!session.extension;
                    const authSuccess = {
                        type: shared_1.MessageType.AUTH_RESPONSE,
                        success: true,
                        peerConnected
                    };
                    ws.send(JSON.stringify(authSuccess));
                    console.log(`[WebSocket] Auth success for ${role} (pairId: ${pairId})`);
                    // Notify peer that status changed
                    notifyPeerStatus(session, role, true);
                    return;
                }
                // Must be authenticated for all other commands
                if (!isAuthenticated || !currentPairId || !currentRole) {
                    const unauthErr = {
                        type: shared_1.MessageType.ERROR,
                        message: 'Unauthenticated message attempt'
                    };
                    ws.send(JSON.stringify(unauthErr));
                    return;
                }
                // Relay command to the opposing peer
                const session = activeSessions.get(currentPairId);
                if (!session)
                    return;
                const targetPeer = currentRole === 'extension' ? session.mobile : session.extension;
                if (targetPeer && targetPeer.ws.readyState === ws_1.default.OPEN) {
                    targetPeer.ws.send(JSON.stringify(message));
                }
                // Log non-ping activity to MongoDB
                if (message.type !== shared_1.MessageType.PING && message.type !== shared_1.MessageType.PONG) {
                    ActivityLog_1.ActivityLog.create({
                        pairId: currentPairId,
                        senderRole: currentRole,
                        actionType: message.type,
                        payload: message
                    }).catch((err) => console.error('[ActivityLog Error]', err));
                }
            }
            catch (err) {
                console.error('[WebSocket Message Error]', err);
            }
        });
        ws.on('close', () => {
            if (currentPairId && currentRole) {
                console.log(`[WebSocket] ${currentRole} disconnected (pairId: ${currentPairId})`);
                const session = activeSessions.get(currentPairId);
                if (session) {
                    if (currentRole === 'extension') {
                        delete session.extension;
                    }
                    else {
                        delete session.mobile;
                    }
                    notifyPeerStatus(session, currentRole, false);
                    if (!session.extension && !session.mobile) {
                        activeSessions.delete(currentPairId);
                    }
                }
            }
        });
    });
    return wss;
}
function notifyPeerStatus(session, changedRole, online) {
    const targetPeer = changedRole === 'extension' ? session.mobile : session.extension;
    if (targetPeer && targetPeer.ws.readyState === ws_1.default.OPEN) {
        const statusMsg = {
            type: shared_1.MessageType.PEER_STATUS_CHANGE,
            peerRole: changedRole,
            online
        };
        targetPeer.ws.send(JSON.stringify(statusMsg));
    }
}
