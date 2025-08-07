import { prisma } from 'connection/prisma';
import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { sessionSchema } from './dto/auth.dto';
import z from 'zod';

export const authSession = async (request: FastifyRequest<{ Body: z.infer<typeof sessionSchema> }>, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;

    const client = await prisma.client.findUnique({
      where: {
        email: email,
      },
    });

    if (!client) {
      return reply.code(401).send({
        message: 'Authentication failed, client not found.',
      });
    }

    const passwordCorrect = await bcrypt.compare(password, client.password);
    if (!passwordCorrect) {
      return reply.status(401).send({
        message: 'Incorrect password',
      });
    }

    const { id } = client;

    const jwtToken = jwt.sign(
      {
        email: client.email,
        clientId: client.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    );

    return reply.status(200).send({
      userId: id,
      token: jwtToken,
    });
  } catch (error) {
    return reply.status(401).send({
      message: 'Authentication failure.',
      success: false,
    });
  }
};