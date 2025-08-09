import type { FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';
import type { uuidParamSchema } from 'common/dto/param.dto';

import { prisma } from '../../connection/prisma';
import type { createGoalSchema, updateGoalSchema } from './dto/goal.dto';

export const createGoal = async (
  request: FastifyRequest<{ Body: z.infer<typeof createGoalSchema> }>,
  reply: FastifyReply,
) => {
  try {
    if (!request.clientData?.id)
      return reply.code(404).send('Client not found');

    const goal = await prisma.goal.create({
      data: {
        ...request.body,
        clientId: request.clientData?.id,
      },
    });

    return reply.code(200).send(goal);
  } catch (error) {
    console.error(error);
    return reply.code(400).send({ error: 'Error creating goal.' });
  }
};

export const getGoals = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const goals = await prisma.goal.findMany({
      where: {
        clientId: request.clientData?.id,
      },
    });

    return reply.code(200).send(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return reply.code(400).send({ error: 'Error fetching goals.' });
  }
};

export const updateGoal = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateGoalSchema>;
    Params: z.infer<typeof uuidParamSchema>;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const existingGoal = await prisma.goal.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingGoal) {
      return reply.code(404).send({ error: 'Goal not found.' });
    }

    if (existingGoal.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only update your own goals.' });
    }

    const updatedGoal = await prisma.goal.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return reply.code(200).send(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return reply.code(400).send({ error: 'Error updating goal.' });
  }
};

export const deleteGoal = async (
  request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const existingGoal = await prisma.goal.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingGoal) {
      return reply.code(404).send({ error: 'Goal not found.' });
    }

    if (existingGoal.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only delete your own goals.' });
    }

    await prisma.goal.delete({
      where: {
        id: id,
      },
    });

    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    return reply.code(400).send({ error: 'Error deleting goal.' });
  }
};
