import { z } from 'zod';

export const MessageTypeEnum = z.enum([
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

export type MessageType = z.infer<typeof MessageTypeEnum>;

export const BaseMessageSchema = z.object({
  type: MessageTypeEnum,
  requestId: z.string().optional(),
  pairId: z.string().optional(),
  timestamp: z.number().optional()
});

export const MouseMoveSchema = BaseMessageSchema.extend({
  type: z.literal('MOUSE_MOVE'),
  dx: z.number(),
  dy: z.number()
});

export const KeyPressSchema = BaseMessageSchema.extend({
  type: z.literal('KEY_PRESS'),
  key: z.enum([
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
  modifiers: z.array(z.string()).optional()
});

export const KeyTypeSchema = BaseMessageSchema.extend({
  type: z.literal('KEY_TYPE'),
  text: z.string()
});

export const CommandResultSchema = BaseMessageSchema.extend({
  type: z.literal('COMMAND_RESULT'),
  requestId: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional()
});
