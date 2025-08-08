import type { FastifyPluginAsync } from 'fastify';
import { createInsurance, getInsurances, updateInsurance, deleteInsurance } from 'controllers/insurance-controller/insurance-controller';
import { uuidParamSchema } from 'common/dto/param.dto';
import { authAccess } from 'middlewares/auth-middleware';
import { createInsuranceSchema, updateInsuranceSchema } from 'controllers/insurance-controller/dto/insurance.dto';

const InsuranceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/insurances', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Create a new insurance policy',
            tags: ['Insurances'],
            body: createInsuranceSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createInsurance);

    fastify.get('/insurances', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Get all insurance policies for the authenticated client',
            tags: ['Insurances'],
            security: [{ bearerAuth: [] }]
        }
    }, getInsurances);

    fastify.patch('/insurances/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Update an insurance policy by ID',
            tags: ['Insurances'],
            params: uuidParamSchema,
            body: updateInsuranceSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateInsurance);

    fastify.delete('/insurances/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Delete an insurance policy by ID',
            tags: ['Insurances'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteInsurance);
};

export { InsuranceRoutes };
