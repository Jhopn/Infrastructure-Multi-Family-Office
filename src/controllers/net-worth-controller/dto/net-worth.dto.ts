import { z } from 'zod';

export const createNetWorthSnapshotSchema = z.object({
  value: z.number('Value is required.'),
  date: z
    .string('Date is required.')
    .datetime({ message: 'Invalid datetime string format.' }),
});

export const getNetWorthQuerySchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Invalid start date format.' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'Invalid end date format.' })
    .optional(),
});
