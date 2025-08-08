import { z } from 'zod';

export const createIdealWalletSchema = z.object({
    assetClass: z.string("Asset class is required."),
    targetPct: z.number("Target percentage is required.").min(0, "Target percentage must be at least 0.").max(100, "Target percentage must be at most 100."),
});

export const updateIdealWalletSchema = createIdealWalletSchema.partial();