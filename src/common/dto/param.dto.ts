import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const clientIdParamSchema = z.object({
    clientId: z.string().uuid("Invalid client UUID format."),
});

export const clientResourceParamsSchema = z.object({
    clientId: z.string().uuid("Invalid client UUID format."),
    outherId: z.string().uuid("Invalid outher UUID format."),
});
