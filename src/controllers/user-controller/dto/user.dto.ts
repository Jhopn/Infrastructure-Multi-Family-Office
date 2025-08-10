import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string("Email is required.").email(),
    password: z.string("Password is required.").min(8, "Password must be at least 8 characters long."),
    accessRole: z.enum(['advisor', 'viewer']), 
});

export const updateUserSchema = createUserSchema.partial();
