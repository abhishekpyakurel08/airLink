import { z } from 'zod';

export const UserPlanEnum = z.enum(['free', 'pro', 'enterprise']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().optional(),
  plan: UserPlanEnum.default('free'),
  created_at: z.date(),
  updated_at: z.date()
});

export const DeviceTypeEnum = z.enum(['PHONE', 'BROWSER', 'DESKTOP']);

export const DeviceSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  name: z.string(),
  type: DeviceTypeEnum,
  platform: z.string(),
  last_seen: z.date(),
  created_at: z.date(),
  updated_at: z.date()
});

export type User = z.infer<typeof UserSchema>;
export type Device = z.infer<typeof DeviceSchema>;
