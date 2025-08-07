import { FastifyPluginAsync } from "fastify";
import { authSession } from "controllers/auth-controller/auth-controller"
import { sessionSchema } from "controllers/auth-controller/dto/auth.dto";

const SessionRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/login', {
        schema: {
            description: "Evaluates the user's credentials and returns the token",
            tags: ['Auth'],
            body: sessionSchema,
        }
    }, authSession);

}

export { SessionRoutes };