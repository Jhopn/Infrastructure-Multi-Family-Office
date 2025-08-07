import { z } from "zod"

export const RoleEnum = z.enum(["user", "admin"])

export const FamilyProfileEnum = z.enum([
  "conservative",
  "moderate",
  "aggressive",
  "very_aggressive",
])

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string(),
  age: z.number().int().min(0).max(120),
  role: RoleEnum.default("user").refine((val) => val === "user", {
    message: "Only 'user' role is allowed via input",
  }),
  familyProfile: FamilyProfileEnum.default("conservative"),
})