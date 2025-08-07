import type { FastifyPluginAsync } from 'fastify';
import { createClient, getClientById, getAllClients, updateClient, deleteClient } from '../../controllers/client-controller/client-controllers';
import { createClientSchema, updateClientSchema } from '../../controllers/client-controller/dto/client.dto';
import { uuidParamSchema } from 'controllers/common/dto/param.dto';

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
            tags: ['Clients'],
            params: uuidParamSchema,
        }
    }, getClientById);

    fastify.get('/clients', {
        schema: {
            description: 'Get all client',
            tags: ['Clients']
        }
    }, getAllClients);

    fastify.patch('/clients/:id', {
        schema: {
            description: 'Update client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
            body: updateClientSchema,
        },
    }, updateClient);

    fastify.delete('/clients/:id', {
        schema: {
            description: 'Delete client by ID',
            tags: ['Clients'],
            params: uuidParamSchema,
        }
    }, deleteClient);
};

export { ClientRoutes };
