import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createGoalSchema, updateGoalSchema } from "./dto/goal.dto";
import { clientIdParamSchema, clientResourceParamsSchema } from "common/dto/param.dto";
import { GoalType } from '@prisma/client';

export const createGoal = async (request: FastifyRequest<{ Body: z.infer<typeof createGoalSchema>, Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
  try {
    const { clientId } = request.params;
    const { type, targetValue, targetDate, subtype, version } = request.body;

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return reply.code(404).send({ error: 'Client not found.' });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: { clientId, type }
    });

    let goal;
    if (existingGoal) {
      goal = await prisma.goal.update({
        where: { id: existingGoal.id },
        data: {
          targetValue,
          targetDate,
          subtype,
          version
        }
      });
    } else {
      goal = await prisma.goal.create({
        data: {
          clientId,
          type,
          subtype,
          targetValue,
          targetDate,
          version
        }
      });
    }

    return reply.code(existingGoal ? 200 : 201).send(goal);

  } catch (error) {
    console.error("Error creating/updating goal:", error);
    return reply.code(400).send({ error: 'Error creating/updating goal.' });
  }
};


export const getGoals = async (request: FastifyRequest<{ Params: z.infer<typeof clientIdParamSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId } = request.params;
        const goals = await prisma.goal.findMany({
            where: {
                clientId: clientId,
            }
        });
        return reply.code(200).send(goals);
    } catch (error) {
        console.error("Error fetching goals:", error);
        return reply.code(400).send({ error: 'Error fetching goals.' });
    }
}

export const updateGoal = async (request: FastifyRequest<{ Body: z.infer<typeof updateGoalSchema>, Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;
        const updateData = request.body;

        const existingGoal = await prisma.goal.findUnique({
            where: { id: outherId }
        });

        if (!existingGoal) {
            return reply.code(404).send({ error: "Goal not found." });
        }

        if (existingGoal.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This goal does not belong to the specified client." });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: outherId },
            data: updateData
        });

        return reply.code(200).send(updatedGoal);
    } catch (error) {
        console.error("Error updating goal:", error);
        return reply.code(400).send({ error: 'Error updating goal.' });
    }
}

export const deleteGoal = async (request: FastifyRequest<{ Params: z.infer<typeof clientResourceParamsSchema> }>, reply: FastifyReply) => {
    try {
        const { clientId, outherId } = request.params;

        const existingGoal = await prisma.goal.findUnique({
            where: { id: outherId }
        });

        if (!existingGoal) {
            return reply.code(404).send({ error: "Goal not found." });
        }

        if (existingGoal.clientId !== clientId) {
            return reply.code(403).send({ error: "Forbidden: This goal does not belong to the specified client." });
        }

        await prisma.goal.delete({
            where: { id: outherId }
        });

        return reply.code(204).send();
    } catch (error) {
        console.error("Error deleting goal:", error);
        return reply.code(400).send({ error: 'Error deleting goal.' });
    }
}

export const getGoalByType = async (request: FastifyRequest, reply: FastifyReply) => {
    const { clientId, type } = request.params as { clientId: string; type: string };

    if (!Object.values(GoalType).includes(type as GoalType)) {
        return reply.code(400).send({ message: 'Tipo de meta inválido.' });
    }

    try {
        const goal = await prisma.goal.findFirst({
            where: {
                clientId,
                type: type as GoalType, 
            },
        });

        if (!goal) {
            return reply.code(404).send({ message: `Meta do tipo ${type} não encontrada para este cliente.` });
        }

        return reply.code(200).send(goal);
    } catch (error) {
        console.error("Erro ao buscar meta:", error);
        return reply.code(400).send({ error: 'Erro ao buscar meta.' });
    }
};
