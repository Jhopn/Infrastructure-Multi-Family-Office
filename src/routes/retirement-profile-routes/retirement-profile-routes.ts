import type { FastifyPluginAsync } from 'fastify';
import {
  createRetirementProfile,
  getRetirementProfile,
  updateRetirementProfile,
  deleteRetirementProfile,
} from 'controllers/retirement-profile-controller/retirement-profile-controller';
import { authAccess } from 'middlewares/auth-middleware';
import {
  createRetirementProfileSchema,
  updateRetirementProfileSchema,
} from 'controllers/retirement-profile-controller/dto/retirement-profile.dto';

const RetirementProfileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/retirement-profile',
    {
      preHandler: authAccess(['User']),
      schema: {
        tags: ['Retirement Profile'],
        security: [{ bearerAuth: [] }],
        description:
          'Create the retirement profile for the authenticated client. Fails if one already exists.',
        body: createRetirementProfileSchema,
      },
    },
    createRetirementProfile,
  );

  fastify.get(
    '/retirement-profile',
    {
      preHandler: authAccess(['User']),
      schema: {
        tags: ['Retirement Profile'],
        security: [{ bearerAuth: [] }],
        description: 'Get the retirement profile for the authenticated client.',
      },
    },
    getRetirementProfile,
  );

  fastify.patch(
    '/retirement-profile',
    {
      preHandler: authAccess(['User']),
      schema: {
        tags: ['Retirement Profile'],
        security: [{ bearerAuth: [] }],
        description:
          'Update the retirement profile for the authenticated client.',
        body: updateRetirementProfileSchema,
      },
    },
    updateRetirementProfile,
  );

  fastify.delete(
    '/retirement-profile',
    {
      preHandler: authAccess(['User']),
      schema: {
        tags: ['Retirement Profile'],
        security: [{ bearerAuth: [] }],
        description:
          'Delete the retirement profile for the authenticated client.',
      },
    },
    deleteRetirementProfile,
  );
};

export { RetirementProfileRoutes };
