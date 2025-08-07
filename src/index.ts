import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { ClientRoutes } from './routes/client-routes/client-routes';
import { SessionRoutes } from './routes/auth-routes/auth-routes';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Multi Family Office API',
            description: 'API documentation for the Multi Family Office application',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        }
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
})

app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

app.register(ClientRoutes);
app.register(SessionRoutes);

app.get('/', async (request, reply) => {
    return { message: 'Hello, world!' };
});


app.listen({ port: 3000 }, (err, address) => {
    console.log(`Server is running at ${address} 🚀`);
});