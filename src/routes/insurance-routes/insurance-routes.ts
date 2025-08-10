import type { FastifyPluginAsync } from 'fastify';
import {
    createInsurance,
    getInsurances,
    updateInsurance,
    deleteInsurance
} from 'controllers/insurance-controller/insurance-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createInsuranceSchema, updateInsuranceSchema } from 'controllers/insurance-controller/dto/insurance.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';

const InsuranceRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/insurances', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new insurance policy for a specific client',
            tags: ['Insurances'],
            params: clientIdParamSchema,
            body: createInsuranceSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createInsurance);

    fastify.get('/clients/:clientId/insurances', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all insurance policies for a specific client',
            tags: ['Insurances'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getInsurances);

    fastify.patch('/clients/:clientId/insurances/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update an insurance policy by ID for a specific client',
            tags: ['Insurances'],
            params: clientResourceParamsSchema,
            body: updateInsuranceSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateInsurance);

    fastify.delete('/clients/:clientId/insurances/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete an insurance policy by ID for a specific client',
            tags: ['Insurances'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteInsurance);
};

export { InsuranceRoutes };
