import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from './dto/client.dto';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';

export const createClient = async (request: FastifyRequest<{ Body: z.infer<typeof createClientSchema> }>, reply: FastifyReply) => {
    try {
        const checkEmail = await prisma.client.findUnique({
            where: {
                email: request.body.email
            }
        });

        if (checkEmail)
            return reply.code(400).send('Existing email');

        const randomSalt = randomInt(10, 16);
        const hashPassword = await bcrypt.hash(request.body.password, randomSalt);

        const client = await prisma.client.create({
            data: {
                ...request.body,
                password: hashPassword,
                ClientAccess: {
                    create: {
                        Access: {
                            connect: {
                                name: 'User',
                            },
                        },
                    },
                },
            },
        }
        );

        return reply.code(201).send(client);
    } catch (error) {
        return reply.code(400).send({ error: 'Error creating client.' });
    }
};

export const getClientById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    try {
        const client = await prisma.client.findUnique({
            where: { id }
        });

        if (!client) {
            return reply.code(404).send({ error: 'Customer not found.' });
        }

        return reply.send(client);
    } catch (error) {
        return reply.code(400).send({ error: 'Error searching for client.' });
    }
}

export const getAllClients = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clients = await prisma.client.findMany();

        return reply.send(clients);
    } catch (error) {
        return reply.code(404).send({ error: 'No customers found.' });
    }
}

export const updateClient = async (request: FastifyRequest<{ Params: { id: string }, Body: z.infer<typeof updateClientSchema> }>, reply: FastifyReply) => {
    const { id } = request.params;

    try {
        const updatedClient = await prisma.client.update({
            where: { id },
            data: request.body
        });

        return reply.send(updatedClient);
    } catch (error) {
        return reply.code(400).send({ error: 'Error updating client.' });
    }
};

export const deleteClient = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    try {
        await prisma.client.delete({
            where: { id }
        });

        return reply.code(204).send();
    } catch (error) {
        return reply.code(400).send({ error: 'Error deleting client.' });
    }
};
