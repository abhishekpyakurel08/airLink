import { z } from 'zod';

export const ShortcutActionSchema = z.object({
  action: z.enum(['open_url', 'close_distractions', 'execute_script']),
  url: z.string().optional(),
  title: z.string().optional()
});

export const ShortcutPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  actions: z.array(ShortcutActionSchema)
});

export type ShortcutPreset = z.infer<typeof ShortcutPresetSchema>;
