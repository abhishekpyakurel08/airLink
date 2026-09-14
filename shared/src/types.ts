export enum MessageType {
  // Connection / Auth
  AUTH_REQUEST = 'AUTH_REQUEST',
  AUTH_RESPONSE = 'AUTH_RESPONSE',
  PEER_STATUS_CHANGE = 'PEER_STATUS_CHANGE',
  PING = 'PING',
  PONG = 'PONG',

  // Media Controls
  MEDIA_PLAY_PAUSE = 'MEDIA_PLAY_PAUSE',
  MEDIA_NEXT = 'MEDIA_NEXT',
  MEDIA_PREV = 'MEDIA_PREV',
  MEDIA_MUTE = 'MEDIA_MUTE',
  VOLUME_SET = 'VOLUME_SET',

  // Tab Management
  TAB_LIST_REQUEST = 'TAB_LIST_REQUEST',
  TAB_LIST_RESPONSE = 'TAB_LIST_RESPONSE',
  TAB_ACTIVATE = 'TAB_ACTIVATE',
  TAB_CLOSE = 'TAB_CLOSE',
  NAVIGATE_URL = 'NAVIGATE_URL',

  // Mouse / Touchpad
  TOUCHPAD_MOVE = 'TOUCHPAD_MOVE',
  TOUCHPAD_CLICK = 'TOUCHPAD_CLICK',
  TOUCHPAD_SCROLL = 'TOUCHPAD_SCROLL',

  // Clipboard & Utilities
  CLIPBOARD_SEND = 'CLIPBOARD_SEND',
  CLIPBOARD_RECEIVE = 'CLIPBOARD_RECEIVE',

  // Generic System / Errors
  ERROR = 'ERROR'
}

export type DeviceRole = 'extension' | 'mobile';

export interface BaseMessage {
  type: MessageType;
  id?: string;
  pairId?: string;
  timestamp?: number;
}

export interface AuthRequestMessage extends BaseMessage {
  type: MessageType.AUTH_REQUEST;
  pairId: string;
  deviceId: string;
  pairSecret: string;
  role: DeviceRole;
}

export interface AuthResponseMessage extends BaseMessage {
  type: MessageType.AUTH_RESPONSE;
  success: boolean;
  message?: string;
  peerConnected?: boolean;
}

export interface PeerStatusMessage extends BaseMessage {
  type: MessageType.PEER_STATUS_CHANGE;
  peerRole: DeviceRole;
  online: boolean;
}

export interface MediaControlPayload extends BaseMessage {
  type:
    | MessageType.MEDIA_PLAY_PAUSE
    | MessageType.MEDIA_NEXT
    | MessageType.MEDIA_PREV
    | MessageType.MEDIA_MUTE;
}

export interface VolumeSetPayload extends BaseMessage {
  type: MessageType.VOLUME_SET;
  volume: number; // 0 to 100
}

export interface TabItem {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
}

export interface TabListResponseMessage extends BaseMessage {
  type: MessageType.TAB_LIST_RESPONSE;
  tabs: TabItem[];
}

export interface TabActionMessage extends BaseMessage {
  type: MessageType.TAB_ACTIVATE | MessageType.TAB_CLOSE;
  tabId: number;
}

export interface NavigateUrlMessage extends BaseMessage {
  type: MessageType.NAVIGATE_URL;
  url: string;
  newTab?: boolean;
}

export interface TouchpadMoveMessage extends BaseMessage {
  type: MessageType.TOUCHPAD_MOVE;
  dx: number;
  dy: number;
}

export interface TouchpadClickMessage extends BaseMessage {
  type: MessageType.TOUCHPAD_CLICK;
  button: 'left' | 'right' | 'middle';
}

export interface TouchpadScrollMessage extends BaseMessage {
  type: MessageType.TOUCHPAD_SCROLL;
  deltaY: number;
}

export interface ClipboardSendMessage extends BaseMessage {
  type: MessageType.CLIPBOARD_SEND | MessageType.CLIPBOARD_RECEIVE;
  text: string;
}

export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR;
  message: string;
}

export type AirLinkWSMessage =
  | AuthRequestMessage
  | AuthResponseMessage
  | PeerStatusMessage
  | MediaControlPayload
  | VolumeSetPayload
  | BaseMessage
  | TabListResponseMessage
  | TabActionMessage
  | NavigateUrlMessage
  | TouchpadMoveMessage
  | TouchpadClickMessage
  | TouchpadScrollMessage
  | ClipboardSendMessage
  | ErrorMessage;

// REST API Pairing Interfaces
export interface InitPairingResponse {
  sessionToken: string;
  pairId: string;
  qrPayload: string;
  expiresInSeconds: number;
}

export interface ConfirmPairingRequest {
  sessionToken: string;
  mobileDeviceId: string;
}

export interface ConfirmPairingResponse {
  success: boolean;
  pairId: string;
  extensionDeviceId: string;
  mobileDeviceId: string;
  pairSecret: string;
}

export interface QRPayloadData {
  pairId: string;
  sessionToken: string;
  serverUrl: string;
}
