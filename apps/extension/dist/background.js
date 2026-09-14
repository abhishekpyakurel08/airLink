import { handleMouseCommand } from './commands/mouse.js';
import { handleKeyboardCommand } from './commands/keyboard.js';
import { handleTabsCommand } from './commands/tabs.js';
import { handleShortcutsCommand } from './commands/shortcuts.js';
const WS_URL = 'ws://localhost:3000/ws';
let socket = null;
let reconnectTimer = null;
console.log('[AirLink Background ServiceWorker] Initialized');
async function connectWebSocket() {
    const storage = await chrome.storage.local.get(['airlink_deviceId', 'airlink_sessionId']);
    if (!storage.airlink_deviceId || !storage.airlink_sessionId) {
        console.log('[Background SW] Extension not paired yet');
        return;
    }
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        return;
    }
    socket = new WebSocket(WS_URL);
    socket.onopen = () => {
        console.log('[Background SW] Connected to WS Gateway');
        socket?.send(JSON.stringify({
            type: 'AUTH_REQUEST',
            deviceId: storage.airlink_deviceId,
            sessionId: storage.airlink_sessionId,
            role: 'BROWSER'
        }));
    };
    socket.onmessage = async (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'PING') {
                socket?.send(JSON.stringify({ type: 'PONG' }));
                return;
            }
            await routeCommand(msg);
        }
        catch (err) {
            console.error('[Background SW] Error handling message:', err);
        }
    };
    socket.onclose = () => {
        console.log('[Background SW] Connection lost. Reconnecting in 3s...');
        scheduleReconnect();
    };
}
function scheduleReconnect() {
    if (reconnectTimer)
        clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectWebSocket, 3000);
}
async function routeCommand(msg) {
    const { type, requestId, payload } = msg;
    try {
        let resultData = null;
        if (type.startsWith('MOUSE_') || type.startsWith('SCROLL_')) {
            await handleMouseCommand(type, payload);
        }
        else if (type.startsWith('KEY_')) {
            await handleKeyboardCommand(type, payload);
        }
        else if (type.startsWith('TAB_') || type === 'NAVIGATE_URL') {
            resultData = await handleTabsCommand(type, payload);
            if (type === 'TAB_LIST_REQUEST') {
                sendResult(requestId, true, resultData, 'TAB_LIST_RESPONSE');
                return;
            }
        }
        else if (type === 'EXECUTE_SHORTCUT') {
            await handleShortcutsCommand(type, payload);
        }
        if (requestId) {
            sendResult(requestId, true);
        }
    }
    catch (err) {
        console.error(`[Background SW Error handling ${type}]`, err);
        if (requestId) {
            sendResult(requestId, false, null, undefined, err.message);
        }
    }
}
function sendResult(requestId, success = true, data, overrideType, error) {
    if (socket && socket.readyState === WebSocket.OPEN && requestId) {
        socket.send(JSON.stringify({
            type: overrideType || 'COMMAND_RESULT',
            requestId,
            success,
            data,
            error
        }));
    }
}
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'PAIRING_COMPLETE') {
        connectWebSocket();
    }
});
connectWebSocket();
