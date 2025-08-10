import type { FastifyPluginAsync } from 'fastify';
import {
    createIdealWalletItem,
    getIdealWalletItems,
    updateIdealWalletItem,
    deleteIdealWalletItem
} from 'controllers/ideal-wallet-controller/ideal-wallet-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createIdealWalletSchema, updateIdealWalletSchema } from 'controllers/ideal-wallet-controller/dto/ideal-wallet.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';

const IdealWalletRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/ideal-wallets', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new ideal wallet item for a specific client',
            tags: ['Ideal Wallets'],
            params: clientIdParamSchema,
            body: createIdealWalletSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createIdealWalletItem);

    fastify.get('/clients/:clientId/ideal-wallets', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all ideal wallet items for a specific client',
            tags: ['Ideal Wallets'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getIdealWalletItems);

    fastify.patch('/clients/:clientId/ideal-wallets/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update an ideal wallet item by ID for a specific client',
            tags: ['Ideal Wallets'],
            params: clientResourceParamsSchema,
            body: updateIdealWalletSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateIdealWalletItem);

    fastify.delete('/clients/:clientId/ideal-wallets/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete an ideal wallet item by ID for a specific client',
            tags: ['Ideal Wallets'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteIdealWalletItem);
};

export { IdealWalletRoutes };
