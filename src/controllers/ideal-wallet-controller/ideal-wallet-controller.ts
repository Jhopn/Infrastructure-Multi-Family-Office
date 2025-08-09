import type { FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';
import type { uuidParamSchema } from 'common/dto/param.dto';

import { prisma } from '../../connection/prisma';
import type {
  createIdealWalletSchema,
  updateIdealWalletSchema,
} from './dto/ideal-wallet.dto';

export const createIdealWalletItem = async (
  request: FastifyRequest<{ Body: z.infer<typeof createIdealWalletSchema> }>,
  reply: FastifyReply,
) => {
  try {
    if (!request.clientData?.id) {
      return reply.code(404).send({ error: 'Client not found.' });
    }

    const idealWalletItem = await prisma.idealWallet.create({
      data: {
        ...request.body,
        clientId: request.clientData.id,
      },
    });

    return reply.code(201).send(idealWalletItem);
  } catch (error) {
    console.error('Error creating ideal wallet item:', error);
    return reply.code(400).send({ error: 'Error creating ideal wallet item.' });
  }
};

export const getIdealWalletItems = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const idealWalletItems = await prisma.idealWallet.findMany({
      where: {
        clientId: request.clientData?.id,
      },
    });

    return reply.code(200).send(idealWalletItems);
  } catch (error) {
    console.error('Error fetching ideal wallet items:', error);
    return reply
      .code(400)
      .send({ error: 'Error fetching ideal wallet items.' });
  }
};

export const updateIdealWalletItem = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateIdealWalletSchema>;
    Params: z.infer<typeof uuidParamSchema>;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const existingItem = await prisma.idealWallet.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return reply.code(404).send({ error: 'Ideal wallet item not found.' });
    }

    if (existingItem.clientId !== request.clientData!.id) {
      return reply.code(403).send({
        error: 'Forbidden: You can only update your own ideal wallet items.',
      });
    }

    const updatedItem = await prisma.idealWallet.update({
      where: { id },
      data: updateData,
    });

    return reply.code(200).send(updatedItem);
  } catch (error) {
    console.error('Error updating ideal wallet item:', error);
    return reply.code(400).send({ error: 'Error updating ideal wallet item.' });
  }
};

export const deleteIdealWalletItem = async (
  request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const existingItem = await prisma.idealWallet.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return reply.code(404).send({ error: 'Ideal wallet item not found.' });
    }

    if (existingItem.clientId !== request.clientData!.id) {
      return reply.code(403).send({
        error: 'Forbidden: You can only delete your own ideal wallet items.',
      });
    }

    await prisma.idealWallet.delete({
      where: { id },
    });

    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting ideal wallet item:', error);
    return reply.code(400).send({ error: 'Error deleting ideal wallet item.' });
  }
};
