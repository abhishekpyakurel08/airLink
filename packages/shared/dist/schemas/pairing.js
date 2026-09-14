"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairRequestSchema = exports.PairingInitResponseSchema = exports.PairingSessionStatusEnum = void 0;
const zod_1 = require("zod");
exports.PairingSessionStatusEnum = zod_1.z.enum(['pending', 'active', 'expired', 'revoked']);
exports.PairingInitResponseSchema = zod_1.z.object({
    code: zod_1.z.string().length(6),
    codeHash: zod_1.z.string(),
    qrPayload: zod_1.z.string(),
    expiresInSeconds: zod_1.z.number()
});
exports.PairRequestSchema = zod_1.z.object({
    code: zod_1.z.string().length(6),
    phoneDeviceId: zod_1.z.string(),
    phoneName: zod_1.z.string().optional()
});
