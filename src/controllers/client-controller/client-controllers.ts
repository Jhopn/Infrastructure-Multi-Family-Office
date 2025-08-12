import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from "./dto/client.dto";
import { uuidParamSchema } from "common/dto/param.dto";

export const createClient = async (request: FastifyRequest<{ Body: z.infer<typeof createClientSchema> }>, reply: FastifyReply) => {
    try {
        const client = await prisma.client.create({
            data: request.body,
        });
        return reply.code(201).send(client);
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return reply.code(409).send({ error: 'A client with this email already exists.' });
        }
        console.error("Error creating client:", error);
        return reply.code(400).send({ error: 'Error creating client.' });
    }
};

export const getClients = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clients = await prisma.client.findMany();
        return reply.code(200).send(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return reply.code(400).send({ error: 'Error fetching clients.' });
    }
};


export const getClientById = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const client = await prisma.client.findUnique({
            where: { id },
        });

        if (!client) {
            return reply.code(404).send({ error: "Client not found." });
        }
        return reply.code(200).send(client);
    } catch (error) {
        console.error("Error fetching client:", error);
        return reply.code(400).send({ error: 'Error fetching client.' });
    }
};

export const updateClient = async (request: FastifyRequest<{ Body: z.infer<typeof updateClientSchema>, Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const updatedClient = await prisma.client.update({
            where: { id },
            data: request.body,
        });
        return reply.code(200).send(updatedClient);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Client not found.' });
        }
        console.error("Error updating client:", error);
        return reply.code(400).send({ error: 'Error updating client.' });
    }
};

export const deleteClient = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        await prisma.client.delete({ where: { id } });
        return reply.code(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Client not found.' });
        }
        console.error("Error deleting client:", error);
        return reply.code(400).send({ error: 'Error deleting client.' });
    }
};

export const getClientsPlanningDistribution = async () => {
    const clients = await prisma.client.findMany({
        select: {
            wallets: { select: { assetClass: true, percentage: true } },
            idealWallets: { select: { assetClass: true, targetPct: true } }
        }
    })

    let distribution = {
        above90: 0,
        between90and70: 0,
        between70and50: 0,
        below50: 0
    }

    clients.forEach(client => {
        if (client.idealWallets.length === 0) return

        const diffs = client.idealWallets.map(ideal => {
            const current = client.wallets.find(w => w.assetClass === ideal.assetClass)
            return Math.abs((current?.percentage ?? 0) - ideal.targetPct)
        })

        const avgMisalignment = diffs.reduce((a, b) => a + b, 0) / diffs.length
        const alignmentScore = 100 - avgMisalignment

        if (alignmentScore > 90) distribution.above90++
        else if (alignmentScore >= 70) distribution.between90and70++
        else if (alignmentScore >= 50) distribution.between70and50++
        else distribution.below50++
    })

    const total = clients.length || 1

    return [
        { label: 'Superior a 90%', percentage: Math.round((distribution.above90 / total) * 100) },
        { label: '90% a 70%', percentage: Math.round((distribution.between90and70 / total) * 100) },
        { label: '70% a 50%', percentage: Math.round((distribution.between70and50 / total) * 100) },
        { label: 'Inferior a 50%', percentage: Math.round((distribution.below50 / total) * 100) }
    ]
}

