import {
  AirLinkWSMessage,
  MessageType,
  TabItem,
  TabListResponseMessage,
  AuthRequestMessage,
  AuthResponseMessage,
  PeerStatusMessage,
  NavigateUrlMessage,
  TabActionMessage,
  TouchpadMoveMessage,
  TouchpadClickMessage,
  TouchpadScrollMessage,
  ClipboardSendMessage,
  VolumeSetPayload
} from '@airlink/shared';

const WS_URL = 'ws://localhost:3000/ws';
let socket: WebSocket | null = null;
let reconnectTimer: any = null;

console.log('[airLink Background SW] Started');

// Listen for messages from Popup UI
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'CONNECT_WEBSOCKET' || msg.action === 'START_PAIRING_WAIT') {
    connectWebSocket();
  }
});

async function connectWebSocket() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }

  const storage = await chrome.storage.local.get([
    'airlink_deviceId',
    'airlink_pairId',
    'airlink_pairSecret'
  ]);

  if (!storage.airlink_deviceId || !storage.airlink_pairId || !storage.airlink_pairSecret) {
    console.log('[Background SW] Device not fully paired yet');
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('[Background SW] WebSocket connected to backend');
    const authMsg: AuthRequestMessage = {
      type: MessageType.AUTH_REQUEST,
      pairId: storage.airlink_pairId,
      deviceId: storage.airlink_deviceId,
      pairSecret: storage.airlink_pairSecret,
      role: 'extension'
    };
    socket?.send(JSON.stringify(authMsg));
  };

  socket.onmessage = async (event) => {
    try {
      const message: AirLinkWSMessage = JSON.parse(event.data);
      await handleIncomingWSMessage(message);
    } catch (err) {
      console.error('[Background SW] Error parsing message:', err);
    }
  };

  socket.onclose = () => {
    console.log('[Background SW] WebSocket disconnected. Reconnecting in 3s...');
    scheduleReconnect();
  };

  socket.onerror = (err) => {
    console.error('[Background SW] WebSocket error:', err);
  };
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    connectWebSocket();
  }, 3000);
}

async function handleIncomingWSMessage(msg: AirLinkWSMessage) {
  console.log('[Background SW] Received command:', msg.type);

  switch (msg.type) {
    case MessageType.AUTH_RESPONSE: {
      const authResp = msg as AuthResponseMessage;
      if (authResp.success) {
        console.log('[Background SW] Authenticated with Server!');
        await chrome.storage.local.set({ airlink_paired: true });
      }
      break;
    }

    case MessageType.TAB_LIST_REQUEST: {
      const tabs = await chrome.tabs.query({});
      const tabItems: TabItem[] = tabs.map((t) => ({
        id: t.id || 0,
        title: t.title || 'Untitled',
        url: t.url || '',
        favIconUrl: t.favIconUrl,
        active: t.active || false
      }));

      const response: TabListResponseMessage = {
        type: MessageType.TAB_LIST_RESPONSE,
        tabs: tabItems
      };
      sendWSMessage(response);
      break;
    }

    case MessageType.TAB_ACTIVATE: {
      const { tabId } = msg as TabActionMessage;
      if (tabId) {
        await chrome.tabs.update(tabId, { active: true });
      }
      break;
    }

    case MessageType.TAB_CLOSE: {
      const { tabId } = msg as TabActionMessage;
      if (tabId) {
        await chrome.tabs.remove(tabId);
      }
      break;
    }

    case MessageType.NAVIGATE_URL: {
      const { url, newTab } = msg as NavigateUrlMessage;
      if (newTab) {
        await chrome.tabs.create({ url });
      } else {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id) {
          await chrome.tabs.update(activeTab.id, { url });
        } else {
          await chrome.tabs.create({ url });
        }
      }
      break;
    }

    case MessageType.MEDIA_PLAY_PAUSE:
      await executeMediaScript('playPause');
      break;

    case MessageType.MEDIA_NEXT:
      await executeMediaScript('next');
      break;

    case MessageType.MEDIA_PREV:
      await executeMediaScript('prev');
      break;

    case MessageType.VOLUME_SET: {
      const { volume } = msg as VolumeSetPayload;
      await executeVolumeScript(volume);
      break;
    }

    case MessageType.TOUCHPAD_SCROLL: {
      const { deltaY } = msg as TouchpadScrollMessage;
      await executeScrollScript(deltaY);
      break;
    }

    case MessageType.CLIPBOARD_SEND: {
      const { text } = msg as ClipboardSendMessage;
      await executeClipboardScript(text);
      break;
    }

    default:
      console.log('[Background SW] Unhandled message type:', msg.type);
  }
}

function sendWSMessage(msg: AirLinkWSMessage) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

async function executeMediaScript(action: 'playPause' | 'next' | 'prev') {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (act) => {
      const media = document.querySelector('video, audio') as HTMLMediaElement;
      if (media) {
        if (act === 'playPause') {
          if (media.paused) media.play();
          else media.pause();
        }
      }
    },
    args: [action]
  });
}

async function executeVolumeScript(volumeLevel: number) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (vol) => {
      const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio');
      const normalizedVol = Math.max(0, Math.min(1, vol / 100));
      mediaElements.forEach((m) => {
        m.volume = normalizedVol;
      });
    },
    args: [volumeLevel]
  });
}

async function executeScrollScript(deltaY: number) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (dy) => {
      window.scrollBy({ top: dy, behavior: 'smooth' });
    },
    args: [deltaY]
  });
}

async function executeClipboardScript(text: string) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (txt) => {
      navigator.clipboard.writeText(txt).catch(() => {});
    },
    args: [text]
  });
}

// Attempt initial WS connection on startup
connectWebSocket();
