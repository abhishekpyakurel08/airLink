"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandResultSchema = exports.KeyTypeSchema = exports.KeyPressSchema = exports.MouseMoveSchema = exports.BaseMessageSchema = exports.MessageTypeEnum = void 0;
const zod_1 = require("zod");
exports.MessageTypeEnum = zod_1.z.enum([
    // Auth & Connection
    'PAIR',
    'PAIR_CONFIRM',
    'AUTH_REQUEST',
    'AUTH_RESPONSE',
    'PEER_STATUS_CHANGE',
    'PING',
    'PONG',
    // Mouse & Touchpad
    'MOUSE_MOVE',
    'MOUSE_CLICK',
    'MOUSE_DOUBLE_CLICK',
    'MOUSE_RIGHT_CLICK',
    'MOUSE_DRAG',
    'SCROLL_UP',
    'SCROLL_DOWN',
    // Keyboard
    'KEY_PRESS',
    'KEY_TYPE',
    // Tabs
    'TAB_LIST_REQUEST',
    'TAB_LIST_RESPONSE',
    'TAB_NEW',
    'TAB_CLOSE',
    'TAB_NEXT',
    'TAB_PREVIOUS',
    'TAB_RELOAD',
    'TAB_PIN',
    'TAB_DUPLICATE',
    'TAB_ACTIVATE',
    // Media
    'MEDIA_PLAY',
    'MEDIA_PAUSE',
    'MEDIA_NEXT',
    'MEDIA_PREVIOUS',
    'VOLUME_UP',
    'VOLUME_DOWN',
    'MUTE',
    // Shortcuts
    'EXECUTE_SHORTCUT',
    // Response tracking & Errors
    'COMMAND_RESULT',
    'ERROR'
]);
exports.BaseMessageSchema = zod_1.z.object({
    type: exports.MessageTypeEnum,
    requestId: zod_1.z.string().optional(),
    pairId: zod_1.z.string().optional(),
    timestamp: zod_1.z.number().optional()
});
exports.MouseMoveSchema = exports.BaseMessageSchema.extend({
    type: zod_1.z.literal('MOUSE_MOVE'),
    dx: zod_1.z.number(),
    dy: zod_1.z.number()
});
exports.KeyPressSchema = exports.BaseMessageSchema.extend({
    type: zod_1.z.literal('KEY_PRESS'),
    key: zod_1.z.enum([
        'Enter',
        'Escape',
        'Tab',
        'Backspace',
        'Space',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Control',
        'Alt',
        'Shift'
    ]),
    modifiers: zod_1.z.array(zod_1.z.string()).optional()
});
exports.KeyTypeSchema = exports.BaseMessageSchema.extend({
    type: zod_1.z.literal('KEY_TYPE'),
    text: zod_1.z.string()
});
exports.CommandResultSchema = exports.BaseMessageSchema.extend({
    type: zod_1.z.literal('COMMAND_RESULT'),
    requestId: zod_1.z.string(),
    success: zod_1.z.boolean(),
    error: zod_1.z.string().optional(),
    data: zod_1.z.any().optional()
});
