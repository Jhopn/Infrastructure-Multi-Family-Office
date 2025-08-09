import { z } from 'zod';

const frequencyEnum = z.enum(['single', 'monthly', 'annual']);

export const createEventSchema = z.object({
    type: z.string("Event type is required."),
    value: z.number("Value is required."),
    frequency: frequencyEnum,
    description: z.string().optional(),
    startDate: z.string("Start date is required.").datetime(),
    endDate: z.string().datetime().optional().nullable(),
}).refine(data => {
    if (data.frequency === 'single' && data.endDate) {
        return false;
    }

    if (data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date, and single events should not have an end date.",
    path: ["endDate"],
});

export const updateEventSchema = createEventSchema.partial();
