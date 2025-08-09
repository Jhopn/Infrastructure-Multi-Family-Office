import type { FastifyPluginAsync } from 'fastify';
import {
  createWalletItem,
  getWalletItems,
  updateWalletItem,
  deleteWalletItem,
} from 'controllers/wallet-controller/wallet-controller';
import { uuidParamSchema } from 'common/dto/param.dto';
import { authAccess } from 'middlewares/auth-middleware';
import {
  createWalletSchema,
  updateWalletSchema,
} from 'controllers/wallet-controller/dto/wallet.dto';

const WalletRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/wallets',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Create a new wallet item',
        tags: ['Wallets'],
        body: createWalletSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    createWalletItem,
  );

  fastify.get(
    '/wallets',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Get all wallet items for the authenticated client',
        tags: ['Wallets'],
        security: [{ bearerAuth: [] }],
      },
    },
    getWalletItems,
  );

  fastify.patch(
    '/wallets/:id',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Update a wallet item by ID',
        tags: ['Wallets'],
        params: uuidParamSchema,
        body: updateWalletSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    updateWalletItem,
  );

  fastify.delete(
    '/wallets/:id',
    {
      preHandler: authAccess(['User']),
      schema: {
        description: 'Delete a wallet item by ID',
        tags: ['Wallets'],
        params: uuidParamSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    deleteWalletItem,
  );
};

export { WalletRoutes };
