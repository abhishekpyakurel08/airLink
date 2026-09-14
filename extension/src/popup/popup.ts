import { drawQRCode } from '../utils/qr';

const BACKEND_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const tokenDisplay = document.getElementById('token-display') as HTMLElement;
  const statusBadge = document.getElementById('status-badge') as HTMLElement;
  const btnRefresh = document.getElementById('btn-refresh') as HTMLButtonElement;
  const btnUnpair = document.getElementById('btn-unpair') as HTMLButtonElement;

  // Check stored pair state
  const storage = await chrome.storage.local.get(['airlink_paired', 'airlink_pairId', 'airlink_deviceId']);
  let deviceId = storage.airlink_deviceId;
  if (!deviceId) {
    deviceId = 'ext_' + Math.random().toString(36).substring(2, 10);
    await chrome.storage.local.set({ airlink_deviceId: deviceId });
  }

  if (storage.airlink_paired) {
    statusBadge.textContent = 'Paired & Connected';
    statusBadge.className = 'status-badge status-connected';
    tokenDisplay.textContent = 'PAIRED';
    btnRefresh.style.display = 'none';
    btnUnpair.style.display = 'block';
  } else {
    await initNewPairing(deviceId);
  }

  btnRefresh.addEventListener('click', async () => {
    await initNewPairing(deviceId);
  });

  btnUnpair.addEventListener('click', async () => {
    await chrome.storage.local.remove(['airlink_paired', 'airlink_pairId', 'airlink_pairSecret']);
    statusBadge.textContent = 'Unpaired';
    statusBadge.className = 'status-badge status-disconnected';
    btnUnpair.style.display = 'none';
    btnRefresh.style.display = 'block';
    await initNewPairing(deviceId);
  });

  async function initNewPairing(extDeviceId: string) {
    try {
      statusBadge.textContent = 'Requesting QR Token...';
      statusBadge.className = 'status-badge status-pending';

      const resp = await fetch(`${BACKEND_URL}/api/pairing/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionDeviceId: extDeviceId,
          serverUrl: 'ws://localhost:3000/ws'
        })
      });

      if (!resp.ok) {
        throw new Error('Server returned ' + resp.status);
      }

      const data = await resp.json();
      tokenDisplay.textContent = data.sessionToken;
      drawQRCode(canvas, data.qrPayload);

      // Save initial pair details
      await chrome.storage.local.set({
        airlink_pairId: data.pairId,
        airlink_sessionToken: data.sessionToken
      });

      statusBadge.textContent = 'Scan QR in Expo App';
      statusBadge.className = 'status-badge status-pending';

      // Notify background script to listen for pairing completion over WS
      chrome.runtime.sendMessage({ action: 'START_PAIRING_WAIT', pairId: data.pairId });
    } catch (err: any) {
      console.error('[Popup Pairing Error]', err);
      statusBadge.textContent = 'Server Offline';
      statusBadge.className = 'status-badge status-disconnected';
      tokenDisplay.textContent = 'OFFLINE';
    }
  }
});
