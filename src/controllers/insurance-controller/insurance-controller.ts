import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createInsuranceSchema, updateInsuranceSchema } from "./dto/insurance.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";

export const createInsurance = async (request: FastifyRequest<{ Body: z.infer<typeof createInsuranceSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;

        const insurance = await prisma.insurance.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(insurance);
    } catch (error) {
        console.error("Error creating insurance:", error);
        return reply.code(400).send({ error: 'Error creating insurance.' });
    }
}

export const getInsurances = async (request: FastifyRequest<{ Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const insurances = await prisma.insurance.findMany({
            where: { clientId: clientId }
        });

        return reply.code(200).send(insurances);
    } catch (error) {
        console.error("Error fetching insurances:", error);
        return reply.code(400).send({ error: 'Error fetching insurances.' });
    }
}

export const updateInsurance = async (request: FastifyRequest<{ Body: z.infer<typeof updateInsuranceSchema>, Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingInsurance = await prisma.insurance.findUnique({
            where: { id: outherId }
        });

        if (!existingInsurance) {
            return reply.code(404).send({ error: "Insurance not found." });
        }

        if (existingInsurance.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This insurance does not belong to the specified client." });
        }

        const updatedInsurance = await prisma.insurance.update({
            where: { id: outherId },
            data: request.body
        });

        return reply.code(200).send(updatedInsurance);
    } catch (error) {
        console.error("Error updating insurance:", error);
        return reply.code(400).send({ error: 'Error updating insurance.' });
    }
}

export const deleteInsurance = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingInsurance = await prisma.insurance.findUnique({
            where: { id: outherId }
        });

        if (!existingInsurance) {
            return reply.code(404).send({ error: "Insurance not found." });
        }

        if (existingInsurance.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This insurance does not belong to the specified client." });
        }

        await prisma.insurance.delete({
            where: { id: outherId }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting insurance:", error);
        return reply.code(400).send({ error: 'Error deleting insurance.' });
    }
}
