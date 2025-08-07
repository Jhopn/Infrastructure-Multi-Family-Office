import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';


const app = fastify();

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