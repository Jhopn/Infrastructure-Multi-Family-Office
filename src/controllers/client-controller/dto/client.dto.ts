import { z } from "zod"

export const FamilyProfileEnum = z.enum([
  "conservative",
  "moderate",
  "aggressive",
  "very_aggressive",
])

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string(),
  age: z.number().int().min(0).max(120),
  status: z.boolean().default(true),
  familyProfile: FamilyProfileEnum.default("conservative"),
})

export const updateClientSchema = createClientSchema.partial();