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
