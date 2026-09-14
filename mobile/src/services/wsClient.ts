import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AirLinkWSMessage,
  MessageType,
  AuthRequestMessage,
  AuthResponseMessage,
  PeerStatusMessage
} from '@airlink/shared';

type MessageListener = (msg: AirLinkWSMessage) => void;
type StatusListener = (connected: boolean, peerOnline: boolean) => void;

class MobileWSClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private isPeerOnline = false;
  private messageListeners: Set<MessageListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: any = null;

  public async connect(wsUrl: string, pairId: string, mobileDeviceId: string, pairSecret: string) {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[Mobile WS] Connected to backend');
        const authMsg: AuthRequestMessage = {
          type: MessageType.AUTH_REQUEST,
          pairId,
          deviceId: mobileDeviceId,
          pairSecret,
          role: 'mobile'
        };
        this.socket?.send(JSON.stringify(authMsg));
      };

      this.socket.onmessage = (event) => {
        try {
          const msg: AirLinkWSMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (err) {
          console.error('[Mobile WS] Message parse error:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[Mobile WS] Connection closed');
        this.isConnected = false;
        this.notifyStatus();
        this.scheduleReconnect(wsUrl, pairId, mobileDeviceId, pairSecret);
      };

      this.socket.onerror = (err) => {
        console.error('[Mobile WS] Connection error:', err);
      };
    } catch (err) {
      console.error('[Mobile WS] Connect exception:', err);
    }
  }

  private handleMessage(msg: AirLinkWSMessage) {
    if (msg.type === MessageType.AUTH_RESPONSE) {
      const authResp = msg as AuthResponseMessage;
      if (authResp.success) {
        this.isConnected = true;
        this.isPeerOnline = !!authResp.peerConnected;
        this.notifyStatus();
      }
    } else if (msg.type === MessageType.PEER_STATUS_CHANGE) {
      const statusMsg = msg as PeerStatusMessage;
      this.isPeerOnline = statusMsg.online;
      this.notifyStatus();
    }

    // Broadcast to all active component listeners
    this.messageListeners.forEach((listener) => listener(msg));
  }

  public sendMessage(msg: AirLinkWSMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      console.warn('[Mobile WS] Cannot send message - socket not connected');
    }
  }

  public addMessageListener(listener: MessageListener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public addStatusListener(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.isConnected, this.isPeerOnline);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus() {
    this.statusListeners.forEach((listener) => listener(this.isConnected, this.isPeerOnline));
  }

  private scheduleReconnect(wsUrl: string, pairId: string, mobileDeviceId: string, pairSecret: string) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(wsUrl, pairId, mobileDeviceId, pairSecret);
    }, 3000);
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.isPeerOnline = false;
    this.notifyStatus();
  }
}

export const mobileWS = new MobileWSClient();
