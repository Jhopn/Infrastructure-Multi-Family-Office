import type { FastifyPluginAsync } from 'fastify';
import { createGoal, getGoals, updateGoal, deleteGoal, getGoalByType } from 'controllers/goal-controller/goal-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createGoalSchema, updateGoalSchema } from 'controllers/goal-controller/dto/goal.dto';
import { clientIdParamSchema, clientResourceParamsSchema } from 'common/dto/param.dto';
import z from 'zod';

const GoalRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/clients/:clientId/goals', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new goal for a specific client',
            tags: ['Goals'],
            params: clientIdParamSchema,
            body: createGoalSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createGoal);

    fastify.get('/clients/:clientId/goals', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get all goals for a specific client',
            tags: ['Goals'],
            params: clientIdParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, getGoals);

    fastify.patch('/clients/:clientId/goals/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update a goal by ID for a specific client',
            tags: ['Goals'],
            params: clientResourceParamsSchema,
            body: updateGoalSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateGoal);

    fastify.delete('/clients/:clientId/goals/:outherId', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a goal by ID for a specific client',
            tags: ['Goals'],
            params: clientResourceParamsSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteGoal);

    fastify.get('/clients/:clientId/goals/:type', {
        preHandler: authAccess(["advisor", "viewer"]),
        schema: {
            description: 'Get a goal by type for a specific client',
            tags: ['Goals'],
            params: z.object({
                clientId: z.string(),
                type: z.enum(["Rendimento", "Sports", "FOBL"])
            }),
            security: [{ bearerAuth: [] }]
        }
    }, getGoalByType);


};

export { GoalRoutes };
