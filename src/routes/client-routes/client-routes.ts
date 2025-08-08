import type { FastifyPluginAsync } from 'fastify';
import { createClient, getClientById, getAllClients, updateClient, deleteClient } from '../../controllers/client-controller/client-controllers';
import { createClientSchema, updateClientSchema } from '../../controllers/client-controller/dto/client.dto';
import { uuidParamSchema } from 'common/dto/param.dto';
import { authAccess } from 'middlewares/auth-middleware';

const ClientRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/clients', {
        schema: {
            description: 'Create a new client',
            tags: ['Clients'],
            body: createClientSchema,
        }
    }, createClient);

    fastify.get('/clients/:id', {
        schema: {
            description: 'Get client by ID',
            preHandler: authAccess(["User"]),
            tags: ['Clients'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getClientById);

    fastify.get('/clients', {
        preHandler: authAccess(["Admin"]),
        schema: {
            description: 'Get all client',
            tags: ['Clients'],
            security: [{ bearerAuth: [] }]
        },
    }, getAllClients);

    fastify.patch('/clients/:id', {
        schema: {
            description: 'Update client by ID',
            tags: ['Clients'],
            preHandler: authAccess(["User"]),
            params: uuidParamSchema,
            body: updateClientSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateClient);

    fastify.delete('/clients/:id', {
        schema: {
            description: 'Delete client by ID',
            tags: ['Clients'],
            preHandler: authAccess(["User"]),
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteClient);
};

export { ClientRoutes };
