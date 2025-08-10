import type { FastifyPluginAsync } from 'fastify';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} from 'controllers/user-controller/user-controller';
import { authAccess } from 'middlewares/auth-middleware';
import { createUserSchema, updateUserSchema } from 'controllers/user-controller/dto/user.dto';
import { uuidParamSchema } from 'common/dto/param.dto';

const UserRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/users', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Create a new user (advisor or viewer)',
            tags: ['Users'],
            body: createUserSchema,
            security: [{ bearerAuth: [] }]
        }
    }, createUser);

    fastify.get('/users', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Get a list of all users',
            tags: ['Users'],
            security: [{ bearerAuth: [] }]
        }
    }, getUsers);

    fastify.patch('/users/:id', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Update a user by ID',
            tags: ['Users'],
            params: uuidParamSchema,
            body: updateUserSchema,
            security: [{ bearerAuth: [] }]
        },
    }, updateUser);

    fastify.delete('/users/:id', {
        preHandler: authAccess(["advisor"]),
        schema: {
            description: 'Delete a user by ID',
            tags: ['Users'],
            params: uuidParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, deleteUser);
};

export { UserRoutes };
