import { z } from 'zod';

const familyProfileEnum = z.enum([
    'conservative',
    'moderate',
    'aggressive',
    'very_aggressive'
]);

export const createClientSchema = z.object({
    name: z.string("Name is required."),
    email: z.string("Email is required.").email("Invalid email format."),
    age: z.number("Age is required.").int().positive().max(120, "Age must be realistic."),
    status: z.boolean("Status is required."),
    familyProfile: familyProfileEnum,
});

export const updateClientSchema = createClientSchema.partial();
