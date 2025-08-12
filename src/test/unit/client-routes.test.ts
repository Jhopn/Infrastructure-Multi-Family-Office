import supertest from 'supertest';
import Fastify, { FastifyInstance } from 'fastify';
import { ClientRoutes } from '../../routes/client-routes/client-routes';
import { prisma } from '../../connection/prisma';
import { validatorCompiler, serializerCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import fastifyJwt from '@fastify/jwt';

describe('Client Routes Integration Tests', () => {
    let app: FastifyInstance;
    let advisorToken: string;
    let viewerToken: string;
    let testClientId: string;

    beforeAll(async () => {
        app = Fastify().withTypeProvider<ZodTypeProvider>();
        app.setValidatorCompiler(validatorCompiler);
        app.setSerializerCompiler(serializerCompiler);
        
        // Register JWT plugin for request.jwtVerify to work
        app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'test-secret' });

        app.register(ClientRoutes);
        await app.ready();

        // --- Setup Test Users and Roles ---
        await prisma.access.createMany({
            data: [{ name: 'advisor' }, { name: 'viewer' }],
            skipDuplicates: true,
        });

        const advisorPassword = await bcrypt.hash('advisorpass', 10);
        const advisor = await prisma.user.upsert({
            where: { email: 'advisor.client@test.com' },
            update: {},
            create: {
                email: 'advisor.client@test.com',
                passwordHash: advisorPassword,
                UserAccess: { create: { Access: { connect: { name: 'advisor' } } } },
            },
        });
        advisorToken = jwt.sign({ id: advisor.id, roles: ['advisor'] }, process.env.JWT_SECRET || 'test-secret');

        const viewerPassword = await bcrypt.hash('viewerpass', 10);
        const viewer = await prisma.user.upsert({
            where: { email: 'viewer.client@test.com' },
            update: {},
            create: {
                email: 'viewer.client@test.com',
                passwordHash: viewerPassword,
                UserAccess: { create: { Access: { connect: { name: 'viewer' } } } },
            },
        });
        viewerToken = jwt.sign({ id: viewer.id, roles: ['viewer'] }, process.env.JWT_SECRET || 'test-secret');
    });

    afterAll(async () => {
        // Clean up all created test data
        await prisma.user.deleteMany({ where: { email: { contains: '.client@test.com' } } });
        await prisma.access.deleteMany({ where: { name: { in: ['advisor', 'viewer'] } } });
        await app.close();
    });

    afterEach(async () => {
        // Clean up clients created during individual tests
        await prisma.client.deleteMany({});
    });

    describe('POST /clients', () => {
        it('should allow an advisor to create a new client', async () => {
            const newClient = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                age: 35,
                status: true,
                familyProfile: 'moderate' as const,
            };

            const response = await supertest(app.server)
                .post('/clients')
                .set('Authorization', `Bearer ${advisorToken}`)
                .send(newClient);

            expect(response.statusCode).toBe(201);
            expect(response.body.email).toBe(newClient.email);
        });

        it('should forbid a viewer from creating a client', async () => {
            const newClient = { name: 'Jane Doe', email: 'jane.doe@example.com', age: 40, status: true, familyProfile: 'conservative' as const };
            
            const response = await supertest(app.server)
                .post('/clients')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send(newClient);

            expect(response.statusCode).toBe(403);
        });

        it('should return 409 if email already exists', async () => {
            const clientData = { name: 'Existing User', email: 'existing@example.com', age: 50, status: true, familyProfile: 'aggressive' as const };
            await prisma.client.create({ data: clientData });

            const response = await supertest(app.server)
                .post('/clients')
                .set('Authorization', `Bearer ${advisorToken}`)
                .send(clientData);

            expect(response.statusCode).toBe(409);
        });
    });

    describe('GET /clients', () => {
        it('should allow an advisor to get all clients', async () => {
            const response = await supertest(app.server)
                .get('/clients')
                .set('Authorization', `Bearer ${advisorToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should allow a viewer to get all clients', async () => {
            const response = await supertest(app.server)
                .get('/clients')
                .set('Authorization', `Bearer ${viewerToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 if no token is provided', async () => {
            const response = await supertest(app.server).get('/clients');
            expect(response.statusCode).toBe(401);
        });
    });

    describe('Client specific routes (/clients/:id)', () => {
        beforeEach(async () => {
            // Create a client for GET, PATCH, DELETE tests
            const client = await prisma.client.create({
                data: { name: 'Test Client', email: 'testclient@example.com', age: 33, status: true, familyProfile: 'moderate' }
            });
            testClientId = client.id;
        });

        it('GET: should allow an advisor to get a client by ID', async () => {
            const response = await supertest(app.server)
                .get(`/clients/${testClientId}`)
                .set('Authorization', `Bearer ${advisorToken}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(testClientId);
        });

        it('GET: should return 404 if client not found', async () => {
            const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
            const response = await supertest(app.server)
                .get(`/clients/${nonExistentId}`)
                .set('Authorization', `Bearer ${advisorToken}`);

            expect(response.statusCode).toBe(404);
        });

        it('PATCH: should allow an advisor to update a client', async () => {
            const updateData = { name: 'Updated Name' };
            const response = await supertest(app.server)
                .patch(`/clients/${testClientId}`)
                .set('Authorization', `Bearer ${advisorToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe('Updated Name');
        });

        it('PATCH: should forbid a viewer from updating a client', async () => {
            const updateData = { name: 'Updated Name' };
            const response = await supertest(app.server)
                .patch(`/clients/${testClientId}`)
                .set('Authorization', `Bearer ${viewerToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(403);
        });

        it('DELETE: should allow an advisor to delete a client', async () => {
            const response = await supertest(app.server)
                .delete(`/clients/${testClientId}`)
                .set('Authorization', `Bearer ${advisorToken}`);

            expect(response.statusCode).toBe(204);
        });

        it('DELETE: should forbid a viewer from deleting a client', async () => {
            const response = await supertest(app.server)
                .delete(`/clients/${testClientId}`)
                .set('Authorization', `Bearer ${viewerToken}`);

            expect(response.statusCode).toBe(403);
        });
    });
});
