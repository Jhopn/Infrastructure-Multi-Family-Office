import supertest from 'supertest';
import Fastify, { FastifyInstance } from 'fastify';
import { UserRoutes } from '../../routes/user-routes/user-routes'; // Rota para registrar/gerenciar usuários
import { AuthRoutes } from '../../routes/auth-routes/auth-routes'; // Rota para o login
import { ClientRoutes } from '../../routes/client-routes/client-routes'; // Rota protegida para teste
import { prisma } from '../../connection/prisma';
import { validatorCompiler, serializerCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';

// Configuração do fastify-jwt para os testes
import fastifyJwt from '@fastify/jwt';

describe('User Authentication E2E Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify().withTypeProvider<ZodTypeProvider>();
        app.setValidatorCompiler(validatorCompiler);
        app.setSerializerCompiler(serializerCompiler);

        // Registra o plugin JWT
        app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'supersecret' });

        // Registra as rotas
        app.register(UserRoutes);
        app.register(AuthRoutes); // Supondo que o login está aqui
        app.register(ClientRoutes); // Para testar rotas protegidas
        
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Limpa as tabelas relevantes antes de cada teste
        await prisma.userAccess.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.access.deleteMany({});

        // Garante que as roles existem para os testes
        await prisma.access.createMany({
            data: [{ name: 'advisor' }, { name: 'viewer' }],
            skipDuplicates: true,
        });
    });

    it('should allow a user to register and then login', async () => {
        const advisor = {
            email: 'advisor-test@example.com',
            password: 'strongpassword123',
            accessRole: 'advisor' as const,
        };

        // 1. Registrar o usuário
        const registerResponse = await supertest(app.server)
            .post('/users') // A rota de criação de usuário
            .set('Authorization', `Bearer FAKE_ADMIN_TOKEN`) // Supondo que a criação de usuário é protegida
            .send(advisor);

        expect(registerResponse.statusCode).toBe(201);
        expect(registerResponse.body.email).toBe(advisor.email);

        // 2. Fazer login com o usuário recém-criado
        const loginResponse = await supertest(app.server)
            .post('/login')
            .send({
                email: advisor.email,
                password: advisor.password,
            });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');
        expect(loginResponse.body).toHaveProperty('userId');
    });

    it('should prevent login with an incorrect password', async () => {
        const viewer = {
            email: 'viewer-test@example.com',
            password: 'password123',
            accessRole: 'viewer' as const,
        };

        await supertest(app.server)
            .post('/users')
            .set('Authorization', `Bearer FAKE_ADMIN_TOKEN`)
            .send(viewer);

        const loginResponse = await supertest(app.server)
            .post('/login')
            .send({
                email: viewer.email,
                password: 'wrong-password',
            });

        expect(loginResponse.statusCode).toBe(401);
        expect(loginResponse.body.message).toBe('Incorrect password');
    });

    it('should allow an authenticated advisor to access a protected route', async () => {
        const advisor = {
            email: 'advisor-protected@example.com',
            password: 'password123',
            accessRole: 'advisor' as const,
        };

        await supertest(app.server).post('/users').set('Authorization', `Bearer FAKE_ADMIN_TOKEN`).send(advisor);

        const loginResponse = await supertest(app.server)
            .post('/login')
            .send({ email: advisor.email, password: advisor.password });

        const token = loginResponse.body.token;

        // Tenta acessar uma rota protegida com o token obtido
        const protectedResponse = await supertest(app.server)
            .get('/clients')
            .set('Authorization', `Bearer ${token}`);
            
        expect(protectedResponse.statusCode).toBe(200);
    });
});


