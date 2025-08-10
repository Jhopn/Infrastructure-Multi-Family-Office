import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createIdealWalletSchema, updateIdealWalletSchema } from "./dto/ideal-wallet.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";

export const createIdealWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof createIdealWalletSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;

        const idealWalletItem = await prisma.idealWallet.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(idealWalletItem);
    } catch (error) {
        console.error("Error creating ideal wallet item:", error);
        return reply.code(400).send({ error: 'Error creating ideal wallet item.' });
    }
}

export const getIdealWalletItems = async (request: FastifyRequest<{ Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const idealWalletItems = await prisma.idealWallet.findMany({
            where: { clientId: clientId }
        });
        return reply.code(200).send(idealWalletItems);
    } catch (error) {
        console.error("Error fetching ideal wallet items:", error);
        return reply.code(400).send({ error: 'Error fetching ideal wallet items.' });
    }
}

export const updateIdealWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof updateIdealWalletSchema>, Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingItem = await prisma.idealWallet.findUnique({
            where: { id: outherId }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Ideal wallet item not found." });
        }

        if (existingItem.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This item does not belong to the specified client." });
        }

        const updatedItem = await prisma.idealWallet.update({
            where: { id: outherId },
            data: request.body
        });

        return reply.code(200).send(updatedItem);
    } catch (error) {
        console.error("Error updating ideal wallet item:", error);
        return reply.code(400).send({ error: 'Error updating ideal wallet item.' });
    }
}

export const deleteIdealWalletItem = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingItem = await prisma.idealWallet.findUnique({
            where: { id: outherId }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Ideal wallet item not found." });
        }

        if (existingItem.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This item does not belong to the specified client." });
        }

        await prisma.idealWallet.delete({
            where: { id: outherId }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting ideal wallet item:", error);
        return reply.code(400).send({ error: 'Error deleting ideal wallet item.' });
    }
}
