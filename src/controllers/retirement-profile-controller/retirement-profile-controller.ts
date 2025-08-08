import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createRetirementProfileSchema, updateRetirementProfileSchema } from "./dto/retirement-profile.dto";

export const createRetirementProfile = async (request: FastifyRequest<{ Body: z.infer<typeof createRetirementProfileSchema> }>, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;
        if (!clientId) {
            return reply.code(404).send({ error: 'Client not found.' });
        }

        const existingProfile = await prisma.retirementProfile.findUnique({
            where: { clientId }
        });

        if (existingProfile) {
            return reply.code(409).send({ error: 'A retirement profile already exists for this client.' });
        }

        const profile = await prisma.retirementProfile.create({
            data: {
                ...request.body,
                clientId: clientId,
            }
        });

        return reply.code(201).send(profile);
    } catch (error) {
        console.error("Error creating retirement profile:", error);
        return reply.code(400).send({ error: 'Error creating retirement profile.' });
    }
}

export const getRetirementProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const profile = await prisma.retirementProfile.findUnique({
            where: {
                clientId: request.clientData?.id,
            }
        });

        if (!profile) {
            return reply.code(404).send({ error: "Retirement profile not found." });
        }

        return reply.code(200).send(profile);
    } catch (error) {
        console.error("Error fetching retirement profile:", error);
        return reply.code(400).send({ error: 'Error fetching retirement profile.' });
    }
}

export const updateRetirementProfile = async (request: FastifyRequest<{ Body: z.infer<typeof updateRetirementProfileSchema> }>, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;
        const updateData = request.body;

        const updatedProfile = await prisma.retirementProfile.update({
            where: { clientId },
            data: updateData
        });

        return reply.code(200).send(updatedProfile);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Retirement profile not found.' });
        }
        console.error("Error updating retirement profile:", error);
        return reply.code(400).send({ error: 'Error updating retirement profile.' });
    }
}

export const deleteRetirementProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clientId = request.clientData?.id;

        await prisma.retirementProfile.delete({
            where: { clientId }
        });

        return reply.code(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Retirement profile not found.' });
        }
        console.error("Error deleting retirement profile:", error);
        return reply.code(400).send({ error: 'Error deleting retirement profile.' });
    }
}
