import { z } from 'zod';

export const createInsuranceSchema = z.object({
  type: z.string('Insurance type is required.'),
  coverageAmount: z
    .number('Coverage amount is required.')
    .positive('Coverage amount must be a positive number.'),
});

export const updateInsuranceSchema = createInsuranceSchema.partial();
