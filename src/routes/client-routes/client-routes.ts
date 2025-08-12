import type { FastifyPluginAsync } from 'fastify';
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    getClientsPlanningDistribution
} from 'controllers/client-controller/client-controllers';
import { authAccess } from 'middlewares/auth-middleware';
import { createClientSchema, updateClientSchema } from 'controllers/client-controller/dto/client.dto';
import { uuidParamSchema } from 'common/dto/param.dto';

const ClientRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new client managed by the user',
            tags: ['Clients'],
            body: createClientSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createClient);

    fastify.get('/clients', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get a list of all clients',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getClients);

    fastify.get('/clients/:id', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get a single client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getClientById);

    fastify.patch('/clients/:id', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update a client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            body: updateClientSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateClient);

    fastify.delete('/clients/:id', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteClient);

    fastify.get('/clients/planning-distribution', {
        preHandler: authAccess(['advisor']),
        schema: {
            description: 'Get percentage distribution of clients by planning alignment',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getClientsPlanningDistribution)

};

export { ClientRoutes };
