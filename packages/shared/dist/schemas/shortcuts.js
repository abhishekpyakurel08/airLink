"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortcutPresetSchema = exports.ShortcutActionSchema = void 0;
const zod_1 = require("zod");
exports.ShortcutActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['open_url', 'close_distractions', 'execute_script']),
    url: zod_1.z.string().optional(),
    title: zod_1.z.string().optional()
});
exports.ShortcutPresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    icon: zod_1.z.string(),
    actions: zod_1.z.array(exports.ShortcutActionSchema)
});
