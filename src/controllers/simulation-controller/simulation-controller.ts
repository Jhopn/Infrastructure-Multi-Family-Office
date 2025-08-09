import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createSimulationSchema } from "./dto/simulation.dto";
import { uuidParamSchema } from "common/dto/param.dto";

export const createSimulation = async (request: FastifyRequest<{ Body: z.infer<typeof createSimulationSchema> }>, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;
        if (!clientId) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const { label, rate, startDate, initialValue, monthlyContribution, years } = request.body;

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
            include: {
                dataPoints: true, 
            },
        });

        return reply.code(201).send(newSimulation);
    } catch (error) {
        console.error("Error creating simulation:", error);
        return reply.code(400).send({ error: 'Error creating simulation.' });
    }
}

export const getSimulations = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const simulations = await prisma.simulation.findMany({
            where: {
                clientId: request.clientData?.id,
            },
            select: {
                id: true,
                label: true,
                rate: true,
                startDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return reply.code(200).send(simulations);
    } catch (error) {
        console.error("Error fetching simulations:", error);
        return reply.code(400).send({ error: 'Error fetching simulations.' });
    }
}

export const getSimulationData = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        const simulation = await prisma.simulation.findFirst({
            where: {
                id: id,
                clientId: request.clientData?.id,
            }
        });

        if (!simulation) {
            return reply.code(404).send({ error: "Simulation not found or you do not have permission to view it." });
        }

        const data = await prisma.simulationData.findMany({
            where: {
                simulationId: id,
            },
            orderBy: {
                year: 'asc',
            }
        });

        return reply.code(200).send(data);
    } catch (error) {
        console.error("Error fetching simulation data:", error);
        return reply.code(400).send({ error: 'Error fetching simulation data.' });
    }
}

export const deleteSimulation = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        const simulation = await prisma.simulation.findFirst({
            where: {
                id: id,
                clientId: request.clientData?.id,
            }
        });

        if (!simulation) {
            return reply.code(404).send({ error: "Simulation not found or you do not have permission to delete it." });
        }

        await prisma.simulation.delete({
            where: { id }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting simulation:", error);
        return reply.code(400).send({ error: 'Error deleting simulation.' });
    }
}
