import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createWalletSchema, updateWalletSchema } from "./dto/wallet.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";

export const createWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof createWalletSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const walletItem = await prisma.wallet.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(walletItem);
    } catch (error) {
        console.error("Error creating wallet item:", error);
        return reply.code(400).send({ error: 'Error creating wallet item.' });
    }
}

export const getWalletItems = async (request: FastifyRequest<{ Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const walletItems = await prisma.wallet.findMany({
            where: { clientId: clientId }
        });

        return reply.code(200).send(walletItems);
    } catch (error) {
        console.error("Error fetching wallet items:", error);
        return reply.code(400).send({ error: 'Error fetching wallet items.' });
    }
}

export const updateWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof updateWalletSchema>, Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;
        const updateData = request.body;

        const existingItem = await prisma.wallet.findUnique({
            where: { id: outherId }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Wallet item not found." });
        }

        if (existingItem.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This wallet item does not belong to the specified client." });
        }

        const updatedItem = await prisma.wallet.update({
            where: { id: outherId },
            data: updateData
        });

        return reply.code(200).send(updatedItem);
    } catch (error) {
        console.error("Error updating wallet item:", error);
        return reply.code(400).send({ error: 'Error updating wallet item.' });
    }
}

export const deleteWalletItem = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingItem = await prisma.wallet.findUnique({
            where: { id: outherId }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Wallet item not found." });
        }

        if (existingItem.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This wallet item does not belong to the specified client." });
        }

        await prisma.wallet.delete({
            where: { id: outherId }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting wallet item:", error);
        return reply.code(400).send({ error: 'Error deleting wallet item.' });
    }
}
