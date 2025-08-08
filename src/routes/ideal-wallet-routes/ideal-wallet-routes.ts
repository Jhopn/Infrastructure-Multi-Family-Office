import type { FastifyPluginAsync } from 'fastify';
import { createIdealWalletItem, getIdealWalletItems, updateIdealWalletItem, deleteIdealWalletItem } from 'controllers/ideal-wallet-controller/ideal-wallet-controller';
import { uuidParamSchema } from 'common/dto/param.dto';
import { authAccess } from 'middlewares/auth-middleware';
import { createIdealWalletSchema, updateIdealWalletSchema } from 'controllers/ideal-wallet-controller/dto/ideal-wallet.dto';

const IdealWalletRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/ideal-wallets', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Create a new ideal wallet item',
            tags: ['Ideal Wallets'],
            body: createIdealWalletSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createIdealWalletItem);


    fastify.get('/ideal-wallets', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Get all ideal wallet items for the authenticated client',
            tags: ['Ideal Wallets'],
            security: [{ bearerAuth: [] }]
        }
    }, getIdealWalletItems);

    fastify.patch('/ideal-wallets/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Update an ideal wallet item by ID',
            tags: ['Ideal Wallets'],
            params: uuidParamSchema,
            body: updateIdealWalletSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateIdealWalletItem);

    fastify.delete('/ideal-wallets/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Delete an ideal wallet item by ID',
            tags: ['Ideal Wallets'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteIdealWalletItem);
};

export { IdealWalletRoutes };