import type { FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';
import type { uuidParamSchema } from 'common/dto/param.dto';

import { prisma } from '../../connection/prisma';
import type {
  createInsuranceSchema,
  updateInsuranceSchema,
} from './dto/insurance.dto';

export const createInsurance = async (
  request: FastifyRequest<{ Body: z.infer<typeof createInsuranceSchema> }>,
  reply: FastifyReply,
) => {
  try {
    if (!request.clientData?.id) {
      return reply.code(404).send({ error: 'Client not found.' });
    }

    const insurance = await prisma.insurance.create({
      data: {
        ...request.body,
        clientId: request.clientData.id,
      },
    });

    return reply.code(201).send(insurance);
  } catch (error) {
    console.error('Error creating insurance:', error);
    return reply.code(400).send({ error: 'Error creating insurance.' });
  }
};

export const getInsurances = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const insurances = await prisma.insurance.findMany({
      where: {
        clientId: request.clientData?.id,
      },
    });

    return reply.code(200).send(insurances);
  } catch (error) {
    console.error('Error fetching insurances:', error);
    return reply.code(400).send({ error: 'Error fetching insurances.' });
  }
};

export const updateInsurance = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateInsuranceSchema>;
    Params: z.infer<typeof uuidParamSchema>;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const existingInsurance = await prisma.insurance.findUnique({
      where: { id },
    });

    if (!existingInsurance) {
      return reply.code(404).send({ error: 'Insurance not found.' });
    }

    if (existingInsurance.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only update your own insurances.' });
    }

    const updatedInsurance = await prisma.insurance.update({
      where: { id },
      data: updateData,
    });

    return reply.code(200).send(updatedInsurance);
  } catch (error) {
    console.error('Error updating insurance:', error);
    return reply.code(400).send({ error: 'Error updating insurance.' });
  }
};

export const deleteInsurance = async (
  request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const existingInsurance = await prisma.insurance.findUnique({
      where: { id },
    });

    if (!existingInsurance) {
      return reply.code(404).send({ error: 'Insurance not found.' });
    }

    if (existingInsurance.clientId !== request.clientData!.id) {
      return reply
        .code(403)
        .send({ error: 'Forbidden: You can only delete your own insurances.' });
    }

    await prisma.insurance.delete({
      where: { id },
    });

    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting insurance:', error);
    return reply.code(400).send({ error: 'Error deleting insurance.' });
  }
};
