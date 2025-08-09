import type { FastifyPluginAsync } from 'fastify';
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
} from 'controllers/event-controller/event-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createEventSchema, updateEventSchema } from 'controllers/event-controller/dto/event.dto';
import { uuidParamSchema } from 'common/dto/param.dto';

const EventRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/events', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Create a new event',
            tags: ['Events'],
            body: createEventSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createEvent);

    fastify.get('/events', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Get all events for the authenticated client',
            tags: ['Events'],
            security: [{ bearerAuth: [] }]
        }
    }, getEvents);

    fastify.patch('/events/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Update an event by ID',
            tags: ['Events'],
            params: uuidParamSchema,
            body: updateEventSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateEvent);

    fastify.delete('/events/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Delete an event by ID',
            tags: ['Events'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteEvent);
};

export { EventRoutes };
