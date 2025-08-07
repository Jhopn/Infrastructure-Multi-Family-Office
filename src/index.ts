import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Multi Family Office API',
            description: 'API documentation for the Multi Family Office application',
            version: '1.0.0',
        },
    },
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
})

app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

app.get('/', async (request, reply) => {
    return { message: 'Hello, world!' };
});

app.listen({ port: 3000 }, (err, address) => {
    console.log(`Server is running at ${address} 🚀`);
});