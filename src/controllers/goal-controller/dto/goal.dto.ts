import { z } from "zod";

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

export const createGoalSchema = z.object({
  type: z.string(),
  subtype: z.string().optional(),
  targetValue: z.number(),
  targetDate: z.coerce.date(),
  version: z.number()
    .int("version must be an integer, no decimals allowed.")
    .refine(val => val >= INT32_MIN && val <= INT32_MAX, {
      message: `version must be between ${INT32_MIN} and ${INT32_MAX}, don't break the database.`,
    }),
})

export const updateGoalSchema = z.object({
  type: z.string().optional(),
  subtype: z.string().optional(),
  targetValue: z.number().optional(),
  targetDate: z.coerce.date().optional(),
  version: z.number()
    .int("version must be an integer, no decimals allowed.")
    .refine(val => val >= INT32_MIN && val <= INT32_MAX, {
      message: `version must be between ${INT32_MIN} and ${INT32_MAX}, don't break the database.`,
    }).optional(),
})
