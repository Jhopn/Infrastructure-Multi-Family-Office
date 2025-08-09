import type { FastifyPluginAsync } from 'fastify';
import {
  createNetWorthSnapshot,
  deleteNetWorthSnapshot,
  getNetWorthSnapshots,
} from 'controllers/net-worth-controller/net-worth-controller';
import { authAccess } from 'middlewares/auth-middleware';
import {
  createNetWorthSnapshotSchema,
  getNetWorthQuerySchema,
} from 'controllers/net-worth-controller/dto/net-worth.dto';
import { uuidParamSchema } from 'common/dto/param.dto';

const NetWorthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/net-worth',
    {
      preHandler: authAccess(['User']),
      schema: {
        description:
          'Create a new net worth snapshot for the authenticated client',
        tags: ['Net Worth'],
        body: createNetWorthSnapshotSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    createNetWorthSnapshot,
  );

  fastify.get(
    '/net-worth',
    {
      preHandler: authAccess(['User']),
      schema: {
        description:
          'Get net worth snapshots for the authenticated client. Can be filtered by date.',
        tags: ['Net Worth'],
        querystring: getNetWorthQuerySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    getNetWorthSnapshots,
  );

  fastify.delete(
    '/net-worth/:id',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Delete a net worth snapshot by ID',
        tags: ['Net Worth'],
        params: uuidParamSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    deleteNetWorthSnapshot,
  );
};

export { NetWorthRoutes };
