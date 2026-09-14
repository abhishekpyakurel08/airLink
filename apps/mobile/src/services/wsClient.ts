import AsyncStorage from '@react-native-async-storage/async-storage';

type MessageListener = (msg: any) => void;
type StatusListener = (connected: boolean) => void;

class AirLinkWSClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private messageListeners: Set<MessageListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: any = null;

  public async connect(wsUrl: string, deviceId: string, sessionId: string) {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[Mobile WS Client] Connected to server');
        this.socket?.send(
          JSON.stringify({
            type: 'AUTH_REQUEST',
            deviceId,
            sessionId,
            role: 'PHONE'
          })
        );
        this.isConnected = true;
        this.notifyStatus();
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PING') {
            this.socket?.send(JSON.stringify({ type: 'PONG' }));
            return;
          }
          this.handleMessage(msg);
        } catch (err: any) {
          console.error('[Mobile WS Client] Message parse error:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[Mobile WS Client] Connection closed. Restoring session in 3s...');
        this.isConnected = false;
        this.notifyStatus();
        this.scheduleReconnect(wsUrl, deviceId, sessionId);
      };
    } catch (err: any) {
      console.error('[Mobile WS Client] Connect exception:', err);
    }
  }

  private handleMessage(msg: any) {
    this.messageListeners.forEach((listener) => listener(msg));
  }

  public sendMessage(msg: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (!msg.requestId) {
        msg.requestId = 'req_' + Math.random().toString(36).substring(2, 9);
      }
      this.socket.send(JSON.stringify(msg));
    }
  }

  public addMessageListener(listener: MessageListener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public addStatusListener(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.isConnected);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus() {
    this.statusListeners.forEach((listener) => listener(this.isConnected));
  }

  private scheduleReconnect(wsUrl: string, deviceId: string, sessionId: string) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(wsUrl, deviceId, sessionId);
    }, 3000);
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyStatus();
  }
}

export const wsClient = new AirLinkWSClient();
