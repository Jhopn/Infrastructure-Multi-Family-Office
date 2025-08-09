import type { FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';
import type { uuidParamSchema } from 'common/dto/param.dto';

import { prisma } from '../../connection/prisma';
import type { createEventSchema, updateEventSchema } from './dto/event.dto';

export const createEvent = async (
  request: FastifyRequest<{ Body: z.infer<typeof createEventSchema> }>,
  reply: FastifyReply,
) => {
  try {
    const clientId = request.clientData?.id;
    if (!clientId) {
      return reply.code(404).send({ error: 'Client not found.' });
    }

    const event = await prisma.event.create({
      data: {
        ...request.body,
        clientId: clientId,
      },
    });

    return reply.code(201).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return reply.code(400).send({ error: 'Error creating event.' });
  }
};

export const getEvents = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        clientId: request.clientData?.id,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return reply.code(200).send(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return reply.code(400).send({ error: 'Error fetching events.' });
  }
};

export const updateEvent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateEventSchema>;
    Params: z.infer<typeof uuidParamSchema>;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return reply.code(404).send({ error: 'Event not found.' });
    }

    if (existingEvent.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only update your own events.' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return reply.code(200).send(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return reply.code(400).send({ error: 'Error updating event.' });
  }
};

export const deleteEvent = async (
  request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return reply.code(404).send({ error: 'Event not found.' });
    }

    if (existingEvent.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only delete your own events.' });
    }

    await prisma.event.delete({
      where: { id },
    });

    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    return reply.code(400).send({ error: 'Error deleting event.' });
  }
};
