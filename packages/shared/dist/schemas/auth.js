"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSchema = exports.DeviceTypeEnum = exports.UserSchema = exports.UserPlanEnum = void 0;
const zod_1 = require("zod");
exports.UserPlanEnum = zod_1.z.enum(['free', 'pro', 'enterprise']);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    avatar_url: zod_1.z.string().optional(),
    plan: exports.UserPlanEnum.default('free'),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date()
});
exports.DeviceTypeEnum = zod_1.z.enum(['PHONE', 'BROWSER', 'DESKTOP']);
exports.DeviceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    type: exports.DeviceTypeEnum,
    platform: zod_1.z.string(),
    last_seen: zod_1.z.date(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date()
});
