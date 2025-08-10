import type { FastifyPluginAsync } from 'fastify';
import {
    createWalletItem,
    getWalletItems,
    updateWalletItem,
    deleteWalletItem
} from 'controllers/wallet-controller/wallet-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createWalletSchema, updateWalletSchema } from 'controllers/wallet-controller/dto/wallet.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';

const WalletRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/wallets', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new wallet item for a specific client',
            tags: ['Wallets'],
            params: clientIdParamSchema,
            body: createWalletSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createWalletItem);

    fastify.get('/clients/:clientId/wallets', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all wallet items for a specific client',
            tags: ['Wallets'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getWalletItems);

    fastify.patch('/clients/:clientId/wallets/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update a wallet item by ID for a specific client',
            tags: ['Wallets'],
            params: clientResourceParamsSchema,
            body: updateWalletSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateWalletItem);

    fastify.delete('/clients/:clientId/wallets/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a wallet item by ID for a specific client',
            tags: ['Wallets'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteWalletItem);
};

export { WalletRoutes };
