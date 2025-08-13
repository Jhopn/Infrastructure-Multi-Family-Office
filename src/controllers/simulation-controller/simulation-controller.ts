import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createSimulationSchema } from "./dto/simulation.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";
import { paginationSchema } from "common/dto/pagination.dto";

function calculateProjection(initialValue: number, monthlyContribution: number, rate: number, years: number) {
    const dataPoints = [];
    let currentValue = initialValue;
    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            currentValue = (currentValue + monthlyContribution) * (1 + monthlyRate);
        }
        dataPoints.push({
            year: year,
            projectedValue: parseFloat(currentValue.toFixed(2)),
        });
    }
    return dataPoints;
}

export const createSimulation = async (request: FastifyRequest<{ Body: z.infer<typeof createSimulationSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const { label, rate, startDate, initialValue, monthlyContribution, years } = request.body;

        const dataPoints = calculateProjection(initialValue, monthlyContribution, rate, years);

        const newSimulation = await prisma.simulation.create({
            data: {
                label,
                rate,
                startDate: new Date(startDate),
                clientId,
                dataPoints: {
                    create: dataPoints,
                },
            },
            include: { dataPoints: true },
        });

        return reply.code(201).send(newSimulation);
    } catch (error) {
        console.error("Error creating simulation:", error);
        return reply.code(400).send({ error: 'Error creating simulation.' });
    }
}

export const getSimulations = async (request: FastifyRequest<{   Params: z.infer<typeof clientIdParamSchema>,Querystring: z.infer<typeof paginationSchema>}>, 
    reply: FastifyReply
) => {
    try {
        const { clientId } = request.params;
        const { page, pageSize } = request.query;

        const offset = (page - 1) * pageSize;


        const [simulations, totalItems] = await prisma.$transaction([
            prisma.simulation.findMany({
                where: { clientId },
                select: { id: true, label: true, rate: true, startDate: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: pageSize,
            }),
            prisma.simulation.count({
                where: { clientId },
            })
        ]);

        const responseData = {
            simulations: simulations, 
            currentPage: page,
            totalPages: Math.ceil(totalItems / pageSize),
        };

        return reply.code(200).send(responseData);

    } catch (error) {
        console.error("Error fetching simulations:", error);
        return reply.code(400).send({ error: 'Error fetching simulations.' });
    }
}

export const getSimulationData = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const simulation = await prisma.simulation.findFirst({
            where: { id: outherId, clientId: clientId }
        });

        if (!simulation) {
            return reply.code(404).send({ error: "Simulation not found for this client." });
        }

        const data = await prisma.simulationData.findMany({
            where: { simulationId: outherId },
            orderBy: { year: 'asc' }
        });

        return reply.code(200).send(data);
    } catch (error) {
        console.error("Error fetching simulation data:", error);
        return reply.code(400).send({ error: 'Error fetching simulation data.' });
    }
}

export const deleteSimulation = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const simulation = await prisma.simulation.findFirst({
            where: { id: outherId, clientId: clientId }
        });

        if (!simulation) {
            return reply.code(404).send({ error: "Simulation not found for this client." });
        }

        await prisma.simulation.delete({ where: { id: outherId } });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting simulation:", error);
        return reply.code(400).send({ error: 'Error deleting simulation.' });
    }
}
