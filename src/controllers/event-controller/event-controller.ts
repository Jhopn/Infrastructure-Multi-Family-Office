import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createEventSchema, updateEventSchema } from "./dto/event.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";

export const createEvent = async (request: FastifyRequest<{ Body: z.infer<typeof createEventSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const event = await prisma.event.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(event);
    } catch (error) {
        console.error("Error creating event:", error);
        return reply.code(400).send({ error: 'Error creating event.' });
    }
}

export const getEvents = async (request: FastifyRequest<{ Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const events = await prisma.event.findMany({
            where: {
                clientId: clientId,
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return reply.code(200).send(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return reply.code(400).send({ error: 'Error fetching events.' });
    }
}

export const updateEvent = async (request: FastifyRequest<{ Body: z.infer<typeof updateEventSchema>, Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params; 
        const updateData = request.body;

        const existingEvent = await prisma.event.findUnique({
            where: { id: outherId }
        });

        if (!existingEvent) {
            return reply.code(404).send({ error: "Event not found." });
        }

        if (existingEvent.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This event does not belong to the specified client." });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: outherId },
            data: updateData
        });

        return reply.code(200).send(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        return reply.code(400).send({ error: 'Error updating event.' });
    }
}

export const deleteEvent = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingEvent = await prisma.event.findUnique({
            where: { id: outherId }
        });

        if (!existingEvent) {
            return reply.code(404).send({ error: "Event not found." });
        }

        if (existingEvent.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This event does not belong to the specified client." });
        }

        await prisma.event.delete({
            where: { id: outherId }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting event:", error);
        return reply.code(400).send({ error: 'Error deleting event.' });
    }
}
