import { z } from 'zod';

const MAX_INT4 = 2147483647;

export const createRetirementProfileSchema = z.object({
  desiredIncome: z.number('Desired income is required.').positive(),
  expectedReturn: z.number('Expected return is required.').min(0),
  pgblContribution: z.number('PGBL contribution is required.').min(0),
  retirementAge: z
    .number()
    .int()
    .positive()
    .max(MAX_INT4, `Retirement age is too high.`)
    .optional(),
  currentContribution: z.number().min(0).optional(),
});

export const updateRetirementProfileSchema =
  createRetirementProfileSchema.partial();
