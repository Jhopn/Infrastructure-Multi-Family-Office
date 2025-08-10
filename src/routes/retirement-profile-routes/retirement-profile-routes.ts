import type { FastifyPluginAsync } from 'fastify';
import {
    createRetirementProfile,
    getRetirementProfile,
    updateRetirementProfile,
    deleteRetirementProfile
} from 'controllers/retirement-profile-controller/retirement-profile-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createRetirementProfileSchema, updateRetirementProfileSchema } from 'controllers/retirement-profile-controller/dto/retirement-profile.dto';
import { clientIdParamSchema } from 'common/dto/param.dto';

const RetirementProfileRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/retirement-profile', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create the retirement profile for a specific client.',
            tags: ['Retirement Profile'],
            params: clientIdParamSchema,
            body: createRetirementProfileSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createRetirementProfile);

    fastify.get('/clients/:clientId/retirement-profile', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get the retirement profile for a specific client.',
            tags: ['Retirement Profile'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getRetirementProfile);

    fastify.patch('/clients/:clientId/retirement-profile', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update the retirement profile for a specific client.',
            tags: ['Retirement Profile'],
            params: clientIdParamSchema,
            body: updateRetirementProfileSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateRetirementProfile);

    fastify.delete('/clients/:clientId/retirement-profile', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete the retirement profile for a specific client.',
            tags: ['Retirement Profile'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteRetirementProfile);
};

export { RetirementProfileRoutes };
