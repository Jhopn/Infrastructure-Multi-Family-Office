import type { FastifyPluginAsync } from 'fastify';
import {
    createSimulation,
    getSimulations,
    getSimulationData,
    deleteSimulation
} from 'controllers/simulation-controller/simulation-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createSimulationSchema } from 'controllers/simulation-controller/dto/simulation.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';
import { paginationSchema } from 'common/dto/pagination.dto';

const SimulationRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/simulations', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new simulation for a specific client',
            tags: ['Simulations'],
            params: clientIdParamSchema,
            body: createSimulationSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createSimulation);

   fastify.get('/clients/:clientId/simulations', {
    preHandler: authAccess(["advisor", "viewer"]),
    schema: {
        description: 'Get all simulations for a specific client, with pagination.',
        tags: ['Simulations'],
        params: clientIdParamSchema,
        querystring: paginationSchema, 
        security: [{ bearerAuth: [] }]
    }
}, getSimulations);

    fastify.get('/clients/:clientId/simulations/:outherId/data', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all data points for a specific simulation',
            tags: ['Simulations'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getSimulationData);

    fastify.delete('/clients/:clientId/simulations/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a simulation and all its associated data by ID',
            tags: ['Simulations'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteSimulation);
};

export { SimulationRoutes };
