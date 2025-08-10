import type { FastifyPluginAsync } from 'fastify';
import {
    createNetWorthSnapshot,
    getNetWorthSnapshots,
    deleteNetWorthSnapshot
} from 'controllers/net-worth-controller/net-worth-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createNetWorthSnapshotSchema, getNetWorthQuerySchema } from 'controllers/net-worth-controller/dto/net-worth.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';

const NetWorthRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/net-worth', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new net worth snapshot for a specific client',
            tags: ['Net Worth'],
            params: clientIdParamSchema,
            body: createNetWorthSnapshotSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createNetWorthSnapshot);

    fastify.get('/clients/:clientId/net-worth', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get net worth snapshots for a specific client. Can be filtered by date.',
            tags: ['Net Worth'],
            params: clientIdParamSchema,
            querystring: getNetWorthQuerySchema,
            security: [{ bearerAuth: [] }]
        }
    }, getNetWorthSnapshots);

    fastify.delete('/clients/:clientId/net-worth/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a net worth snapshot by ID for a specific client',
            tags: ['Net Worth'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteNetWorthSnapshot);
};

export { NetWorthRoutes };
