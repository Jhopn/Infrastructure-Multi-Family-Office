import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from "./dto/user.dto";
import bcrypt from 'bcryptjs';
import { uuidParamSchema } from "common/dto/param.dto";


function exclude<T, Key extends keyof T>(obj: T, keys: Key[]): Omit<T, Key> {
    for (let key of keys) {
        delete obj[key];
    }
    return obj;
}

export const createUser = async (request: FastifyRequest<{ Body: z.infer<typeof createUserSchema> }>, reply: FastifyReply) => {
    try {
        const { email, password, accessRole } = request.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.code(409).send({ error: "User with this email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                UserAccess: {
                    create: {
                        Access: {
                            connect: { name: accessRole }
                        }
                    }
                }
            }
        });

        const userResponse = exclude(user, ['passwordHash']);
        return reply.code(201).send(userResponse);

    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(400).send({ error: `The access role '${request.body.accessRole}' does not exist.` });
        }
        console.error("Error registering user:", error);
        return reply.code(500).send({ error: "Internal server error during registration." });
    }
};

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
                UserAccess: {
                    select: {
                        Access: {
                            select: { name: true }
                        }
                    }
                }
            }
        });
        return reply.code(200).send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return reply.code(500).send({ error: "Error fetching users." });
    }
};


export const updateUser = async (request: FastifyRequest<{ Body: z.infer<typeof updateUserSchema>, Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const { email, password, accessRole } = request.body;

        const dataToUpdate: any = {};
        if (email) dataToUpdate.email = email;
        if (password) dataToUpdate.passwordHash = await bcrypt.hash(password, 10);

        if (accessRole) {
            const userAccess = await prisma.userAccess.findFirst({ where: { userId: id } });
            if (userAccess) {
                await prisma.userAccess.update({
                    where: { id: userAccess.id },
                    data: { Access: { connect: { name: accessRole } } }
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });

        const userResponse = exclude(updatedUser, ['passwordHash']);
        return reply.code(200).send(userResponse);

    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'User not found.' });
        }
        console.error("Error updating user:", error);
        return reply.code(500).send({ error: 'Error updating user.' });
    }
};

export const deleteUser = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        await prisma.user.delete({ where: { id } });

        return reply.code(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'User not found.' });
        }
        console.error("Error deleting user:", error);
        return reply.code(500).send({ error: 'Error deleting user.' });
    }
};
