"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    // Connection / Auth
    MessageType["AUTH_REQUEST"] = "AUTH_REQUEST";
    MessageType["AUTH_RESPONSE"] = "AUTH_RESPONSE";
    MessageType["PEER_STATUS_CHANGE"] = "PEER_STATUS_CHANGE";
    MessageType["PING"] = "PING";
    MessageType["PONG"] = "PONG";
    // Media Controls
    MessageType["MEDIA_PLAY_PAUSE"] = "MEDIA_PLAY_PAUSE";
    MessageType["MEDIA_NEXT"] = "MEDIA_NEXT";
    MessageType["MEDIA_PREV"] = "MEDIA_PREV";
    MessageType["MEDIA_MUTE"] = "MEDIA_MUTE";
    MessageType["VOLUME_SET"] = "VOLUME_SET";
    // Tab Management
    MessageType["TAB_LIST_REQUEST"] = "TAB_LIST_REQUEST";
    MessageType["TAB_LIST_RESPONSE"] = "TAB_LIST_RESPONSE";
    MessageType["TAB_ACTIVATE"] = "TAB_ACTIVATE";
    MessageType["TAB_CLOSE"] = "TAB_CLOSE";
    MessageType["NAVIGATE_URL"] = "NAVIGATE_URL";
    // Mouse / Touchpad
    MessageType["TOUCHPAD_MOVE"] = "TOUCHPAD_MOVE";
    MessageType["TOUCHPAD_CLICK"] = "TOUCHPAD_CLICK";
    MessageType["TOUCHPAD_SCROLL"] = "TOUCHPAD_SCROLL";
    // Clipboard & Utilities
    MessageType["CLIPBOARD_SEND"] = "CLIPBOARD_SEND";
    MessageType["CLIPBOARD_RECEIVE"] = "CLIPBOARD_RECEIVE";
    // Generic System / Errors
    MessageType["ERROR"] = "ERROR";
})(MessageType || (exports.MessageType = MessageType = {}));
