import type { FastifyPluginAsync } from 'fastify';
import {
  createSimulation,
  getSimulations,
  getSimulationData,
  deleteSimulation,
} from 'controllers/simulation-controller/simulation-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createSimulationSchema } from 'controllers/simulation-controller/dto/simulation.dto';
import { uuidParamSchema } from 'common/dto/param.dto';

const SimulationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/simulations',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Create a new simulation and its projected data points',
        tags: ['Simulations'],
        body: createSimulationSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    createSimulation,
  );

  fastify.get(
    '/simulations',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Get all simulations for the authenticated client',
        tags: ['Simulations'],
        security: [{ bearerAuth: [] }],
      },
    },
    getSimulations,
  );

  fastify.get(
    '/simulations/:id/data',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Get all data points for a specific simulation',
        tags: ['Simulations'],
        params: uuidParamSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    getSimulationData,
  );

  fastify.delete(
    '/simulations/:id',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Delete a simulation and all its associated data by ID',
        tags: ['Simulations'],
        params: uuidParamSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    deleteSimulation,
  );
};

export { SimulationRoutes };
