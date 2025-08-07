import type { FastifyPluginAsync } from 'fastify';
import { createClient } from '../../controllers/client-controller/client-controllers';
import { createUserSchema } from '../../controllers/client-controller/dto/create-client.dto';

const ClientRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/clients', {
    schema: {
      description: 'Create a new client',
      tags: ['Clients'],
      body: createUserSchema,
    },
  }, createClient);
};

export {ClientRoutes};
