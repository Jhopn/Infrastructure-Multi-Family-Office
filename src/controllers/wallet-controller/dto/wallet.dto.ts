import { z } from 'zod';

const MAX_INT4 = 2147483647;

export const createWalletSchema = z.object({
    totalValue: z.number("Total value is required.").positive("Total value must be a positive number."),
    assetClass: z.string("Asset class is required."),
    percentage: z.number("Percentage is required.").min(0).max(100, "Percentage must be between 0 and 100."),
    category: z.string("Category is required."),
    indexer: z.string().optional(),
    custodian: z.string().optional(),
    liquidityDays: z.number().int("Liquidity days must be an integer.").positive("Liquidity days must be a positive integer.").max(MAX_INT4, `Liquidity days must be less than or equal to ${MAX_INT4}.`).optional(),
});


export const updateWalletSchema = createWalletSchema.partial();