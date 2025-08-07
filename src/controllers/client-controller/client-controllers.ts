import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createUserSchema } from './dto/create-client.dto';

type CreateClientRequest = FastifyRequest<{
  Body: z.infer<typeof createUserSchema>
}>;

export const createClient = async (request: CreateClientRequest, reply: FastifyReply) => {
  try {
    const client = await prisma.client.create({
      data:{
        email: request.body.email,
        password: request.body.password, 
        role: request.body.role,
        name: request.body.name,
        age: request.body.age,
        status: true,
        familyProfile: request.body.familyProfile
      }
    });

    return reply.code(201).send(client);
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao criar cliente.' });
  }
};
