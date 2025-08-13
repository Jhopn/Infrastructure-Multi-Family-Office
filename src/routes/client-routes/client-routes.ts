import type { FastifyPluginAsync } from 'fastify';
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    getClientsPlanningDistribution,
    getClientsPlanningSummary,
    getClientsTable,
    getFamilyProfileSummary,
    getClientsIdName
} from 'controllers/client-controller/client-controllers';
import { authAccess } from 'middlewares/auth-middleware';
import { createClientSchema, updateClientSchema } from 'controllers/client-controller/dto/client.dto';
import { uuidParamSchema } from 'common/dto/param.dto';
import { paginationSchema } from 'common/dto/pagination.dto';

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
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Update a client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            body: updateClientSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateClient);

    fastify.delete('/clients/:id', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Delete a client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteClient);

    fastify.get('/clients/planning-distribution', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get percentage distribution of clients by planning alignment',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getClientsPlanningDistribution)

    fastify.get('/clients/planning-summary', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get summary of clients by planning',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getClientsPlanningSummary)

    fastify.get('/clients/table', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get clients list for planning table with pagination',
            tags: ['Clients'],
            querystring: paginationSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getClientsTable)

    fastify.get('/clients/family-profile-summary', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get family profile percentage summary',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getFamilyProfileSummary)

    fastify.get('/clients/id-name', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get list of clients with only id and name',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        }
    }, getClientsIdName)

};

export { ClientRoutes };
