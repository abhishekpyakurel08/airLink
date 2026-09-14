import { z } from 'zod';

export const PairingSessionStatusEnum = z.enum(['pending', 'active', 'expired', 'revoked']);

export const PairingInitResponseSchema = z.object({
  code: z.string().length(6),
  codeHash: z.string(),
  qrPayload: z.string(),
  expiresInSeconds: z.number()
});

export const PairRequestSchema = z.object({
  code: z.string().length(6),
  phoneDeviceId: z.string(),
  phoneName: z.string().optional()
});

export type PairingInitResponse = z.infer<typeof PairingInitResponseSchema>;
export type PairRequest = z.infer<typeof PairRequestSchema>;
