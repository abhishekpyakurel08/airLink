import { drawQRCode } from '../utils/qr';

const BACKEND_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const tokenDisplay = document.getElementById('token-display') as HTMLElement;
  const statusBadge = document.getElementById('status-badge') as HTMLElement;
  const btnRefresh = document.getElementById('btn-refresh') as HTMLButtonElement;

  const storage = await chrome.storage.local.get(['airlink_deviceId']);
  let deviceId = storage.airlink_deviceId;
  if (!deviceId) {
    deviceId = 'ext_' + Math.random().toString(36).substring(2, 10);
    await chrome.storage.local.set({ airlink_deviceId: deviceId });
  }

  btnRefresh.addEventListener('click', () => initPairing(deviceId));

  await initPairing(deviceId);

  async function initPairing(extDeviceId: string) {
    try {
      statusBadge.textContent = 'Generating 60s Token...';
      const resp = await fetch(`${BACKEND_URL}/api/pairing/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionDeviceId: extDeviceId })
      });

      if (!resp.ok) throw new Error('Backend offline');

      const data = await resp.json();
      tokenDisplay.textContent = data.code;
      drawQRCode(canvas, data.qrPayload);

      statusBadge.textContent = 'Scan QR or enter 6-char code';
      statusBadge.className = 'status-badge status-pending';

      await chrome.storage.local.set({ airlink_pendingCode: data.code });
    } catch (err: any) {
      statusBadge.textContent = 'Server Offline';
      statusBadge.className = 'status-badge status-pending';
      tokenDisplay.textContent = 'OFFLINE';
    }
  }
});
