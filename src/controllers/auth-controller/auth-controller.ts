import { prisma } from 'connection/prisma'; 
import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { sessionSchema } from './dto/auth.dto';
import z from 'zod';


export const authSession = async (request: FastifyRequest<{ Body: z.infer<typeof sessionSchema> }>, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;

    const user = await prisma.client.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return reply.code(401).send({
        message: 'Autenticação falhou, usuário não encontrado.',
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return reply.status(401).send({
        message: 'Senha incorreta',
      });
    }

    const { id } = user;

    const jwtToken = jwt.sign(
      {
        email: user.email,
        userId: user.id,
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
      message: 'Falha de autenticação.',
      success: false,
    });
  }
};