import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createWalletSchema, updateWalletSchema } from "./dto/wallet.dto";
import { uuidParamSchema } from "common/dto/param.dto";


export const createWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof createWalletSchema> }>, reply: FastifyReply) => {
    try {
        if (!request.clientData?.id) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const walletItem = await prisma.wallet.create({
            data: {
                ...request.body,
                clientId: request.clientData.id,
            }
        });

        return reply.code(201).send(walletItem); 
    } catch (error) {
        console.error("Error creating wallet item:", error);
        return reply.code(400).send({ error: 'Error creating wallet item.' });
    }
}

export const getWalletItems = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const walletItems = await prisma.wallet.findMany({
            where: {
                clientId: request.clientData?.id,
            }
        });

        return reply.code(200).send(walletItems);
    } catch (error) {
        console.error("Error fetching wallet items:", error);
        return reply.code(400).send({ error: 'Error fetching wallet items.' });
    }
}


export const updateWalletItem = async (request: FastifyRequest<{ Body: z.infer<typeof updateWalletSchema>, Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const updateData = request.body;

        const existingItem = await prisma.wallet.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Wallet item not found." });
        }

        if (existingItem.clientId !== request.clientData!.id) {
            return reply.code(403).send({ error: "Forbidden: You can only update your own wallet items." });
        }

        const updatedItem = await prisma.wallet.update({
            where: { id },
            data: updateData
        });

        return reply.code(200).send(updatedItem);
    } catch (error) {
        console.error("Error updating wallet item:", error);
        return reply.code(400).send({ error: 'Error updating wallet item.' });
    }
}

export const deleteWalletItem = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        const existingItem = await prisma.wallet.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return reply.code(404).send({ error: "Wallet item not found." });
        }

        if (existingItem.clientId !== request.clientData!.id) {
            return reply.code(403).send({ error: "Forbidden: You can only delete your own wallet items." });
        }

        await prisma.wallet.delete({
            where: { id }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting wallet item:", error);
        return reply.code(400).send({ error: 'Error deleting wallet item.' });
    }
}