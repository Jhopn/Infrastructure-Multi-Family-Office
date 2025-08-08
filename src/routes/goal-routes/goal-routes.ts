import type { FastifyPluginAsync } from 'fastify';
import { createGoal, getGoals, updateGoal, deleteGoal } from 'controllers/goal-controller/goal-controller';
import { uuidParamSchema } from 'common/dto/param.dto';
import { authAccess } from 'middlewares/auth-middleware';
import { createGoalSchema, updateGoalSchema } from 'controllers/goal-controller/dto/goal.dto';

const GoalRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/goals', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Create a new goal',
            tags: ['Goals'],
            body: createGoalSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createGoal);

    fastify.get('/goals', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Get goal by clientId',
            tags: ['Goals'],
            security: [{ bearerAuth: [] }]
        }
    }, getGoals);

    fastify.patch('/goals/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Update goal by ID',
            tags: ['Goals'],
            params: uuidParamSchema,
            body: updateGoalSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateGoal);

    fastify.delete('/goals/:id', {
        preHandler: authAccess(["User"]),
        schema: {
            description: 'Delete goal by ID',
            tags: ['Goals'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteGoal);
};

export { GoalRoutes };