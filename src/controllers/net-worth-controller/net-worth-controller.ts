import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createNetWorthSnapshotSchema, getNetWorthQuerySchema } from "./dto/net-worth.dto";
import { uuidParamSchema } from "common/dto/param.dto";

export const createNetWorthSnapshot = async (request: FastifyRequest<{ Body: z.infer<typeof createNetWorthSnapshotSchema> }>, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;
        if (!clientId) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const snapshot = await prisma.netWorthSnapshot.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(snapshot);
    } catch (error) {
        console.error("Error creating net worth snapshot:", error);
        return reply.code(400).send({ error: 'Error creating net worth snapshot.' });
    }
}

export const getNetWorthSnapshots = async (request: FastifyRequest<{ Querystring: z.infer<typeof getNetWorthQuerySchema> }>, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;
        const { startDate, endDate } = request.query;

        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }

        const snapshots = await prisma.netWorthSnapshot.findMany({
            where: {
                clientId: clientId,
                ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
            },
            orderBy: {
                date: 'asc'
            }
        });

        return reply.code(200).send(snapshots);
    } catch (error) {
        console.error("Error fetching net worth snapshots:", error);
        return reply.code(400).send({ error: 'Error fetching net worth snapshots.' });
    }
}

export const deleteNetWorthSnapshot = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const clientId = request.clientData?.id;

        const existingSnapshot = await prisma.netWorthSnapshot.findUnique({
            where: { id }
        });

        if (!existingSnapshot) {
            return reply.code(404).send({ error: "Net worth snapshot not found." });
        }

        if (existingSnapshot.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: You can only delete your own snapshots." });
        }

        await prisma.netWorthSnapshot.delete({
            where: { id }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting net worth snapshot:", error);
        return reply.code(400).send({ error: 'Error deleting net worth snapshot.' });
    }
}

