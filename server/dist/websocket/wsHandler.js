import WebSocket, { WebSocketServer } from 'ws';
import { MessageType } from '@airlink/shared';
import { PairingService } from '../services/pairingService';
import { ActivityLog } from '../models/ActivityLog';
// Map pairId -> PeerSession
const activeSessions = new Map();
export function setupWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        let currentPairId = null;
        let currentRole = null;
        let isAuthenticated = false;
        console.log('[WebSocket] New client connected');
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                // Handle initial authentication
                if (message.type === MessageType.AUTH_REQUEST) {
                    const authMsg = message;
                    const { pairId, deviceId, pairSecret, role } = authMsg;
                    const isValid = await PairingService.validateDeviceAuth(pairId, deviceId, pairSecret, role);
                    if (!isValid) {
                        const authFail = {
                            type: MessageType.AUTH_RESPONSE,
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
                        type: MessageType.AUTH_RESPONSE,
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
                        type: MessageType.ERROR,
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
                if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
                    targetPeer.ws.send(JSON.stringify(message));
                }
                // Log non-ping activity to MongoDB
                if (message.type !== MessageType.PING && message.type !== MessageType.PONG) {
                    ActivityLog.create({
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
    if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
        const statusMsg = {
            type: MessageType.PEER_STATUS_CHANGE,
            peerRole: changedRole,
            online
        };
        targetPeer.ws.send(JSON.stringify(statusMsg));
    }
}
