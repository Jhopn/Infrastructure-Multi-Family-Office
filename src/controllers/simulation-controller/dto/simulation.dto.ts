import { z } from 'zod';

export const createSimulationSchema = z.object({
  label: z.string('Simulation label is required.').min(3),
  rate: z.number('Annual rate is required.').min(0),
  startDate: z.string('Start date is required.').datetime(),
  initialValue: z.number('Initial value is required.').min(0),
  monthlyContribution: z.number('Monthly contribution is required.').min(0),
  years: z
    .number('Number of years is required.')
    .int()
    .positive()
    .max(100, 'Simulation cannot exceed 100 years.'),
});
