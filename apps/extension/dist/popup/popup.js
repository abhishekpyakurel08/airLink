import { drawQRCode } from '../utils/qr.js';
const BACKEND_URL = 'http://localhost:3000';
async function initPopup() {
    const canvas = document.getElementById('qr-canvas');
    const tokenDisplay = document.getElementById('token-display');
    const statusBadge = document.getElementById('status-badge');
    const btnRefresh = document.getElementById('btn-refresh');
    if (!canvas || !tokenDisplay || !statusBadge || !btnRefresh)
        return;
    const storage = await chrome.storage.local.get(['airlink_deviceId']);
    let deviceId = storage.airlink_deviceId;
    if (!deviceId) {
        deviceId = 'ext_' + Math.random().toString(36).substring(2, 10);
        await chrome.storage.local.set({ airlink_deviceId: deviceId });
    }
    btnRefresh.addEventListener('click', () => initPairing(deviceId));
    await initPairing(deviceId);
    async function initPairing(extDeviceId) {
        try {
            statusBadge.textContent = 'Generating 60s Token...';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const resp = await fetch(`${BACKEND_URL}/api/pairing/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extensionDeviceId: extDeviceId }),
                signal: controller.signal
            }).catch(() => null);
            clearTimeout(timeoutId);
            if (!resp || !resp.ok) {
                statusBadge.textContent = 'Server Offline (Start server on :3000)';
                statusBadge.style.backgroundColor = '#ef4444';
                statusBadge.style.color = '#ffffff';
                tokenDisplay.textContent = 'OFFLINE';
                drawQRCode(canvas, 'airlink://pair/OFFLINE');
                return;
            }
            const data = await resp.json();
            tokenDisplay.textContent = data.code;
            drawQRCode(canvas, data.qrPayload || `airlink://pair/${data.code}`);
            statusBadge.textContent = 'Scan QR or enter 6-char code';
            statusBadge.style.backgroundColor = '#22c55e';
            statusBadge.style.color = '#ffffff';
            await chrome.storage.local.set({ airlink_pendingCode: data.code });
        }
        catch (err) {
            statusBadge.textContent = 'Server Offline';
            statusBadge.style.backgroundColor = '#ef4444';
            statusBadge.style.color = '#ffffff';
            tokenDisplay.textContent = 'OFFLINE';
            drawQRCode(canvas, 'airlink://pair/OFFLINE');
        }
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
}
else {
    initPopup();
}
