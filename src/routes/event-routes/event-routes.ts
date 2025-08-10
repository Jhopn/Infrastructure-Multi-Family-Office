import type { FastifyPluginAsync } from 'fastify';
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
} from 'controllers/event-controller/event-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createEventSchema, updateEventSchema } from 'controllers/event-controller/dto/event.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';

const EventRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/events', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new event for a specific client',
            tags: ['Events'],
            params: clientIdParamSchema,
            body: createEventSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createEvent);

    fastify.get('/clients/:clientId/events', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all events for a specific client',
            tags: ['Events'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getEvents);

    fastify.put('/clients/:clientId/events/:eventId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update an event by ID for a specific client',
            tags: ['Events'],
            params: clientResourceParamsSchema,
            body: updateEventSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateEvent);

    fastify.delete('/clients/:clientId/events/:eventId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete an event by ID for a specific client',
            tags: ['Events'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteEvent);
};

export { EventRoutes };
