import supertest from 'supertest';
import Fastify, { FastifyInstance } from 'fastify';
import { AuthRoutes } from '../../routes/auth-routes/auth-routes'; // Supondo que o login está aqui
import { prisma } from '../../connection/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatorCompiler, serializerCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

// Mock do Prisma para focar nos testes da rota
jest.mock('../../connection/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

// Mock das bibliotecas de dependência
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('Auth Routes Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify().withTypeProvider<ZodTypeProvider>();
        app.setValidatorCompiler(validatorCompiler);
        app.setSerializerCompiler(serializerCompiler);
        app.register(AuthRoutes); // Registra as rotas de autenticação
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and a token for a successful login', async () => {
        // Mock do usuário encontrado no banco
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 'user-uuid-123',
            email: 'advisor@example.com',
            passwordHash: 'hashedpassword',
            UserAccess: [{ Access: { name: 'advisor' } }],
        });
        // Mock da comparação de senha bem-sucedida
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        // Mock da geração do token
        (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');

        const response = await supertest(app.server)
            .post('/login')
            .send({
                email: 'advisor@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            userId: 'user-uuid-123',
            token: 'mocked-jwt-token',
        });
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(jwt.sign).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if the user is not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const response = await supertest(app.server)
            .post('/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            message: 'Authentication failed, user not found.',
        });
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 401 for an incorrect password', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 'user-uuid-123',
            email: 'advisor@example.com',
            passwordHash: 'hashedpassword',
            UserAccess: [],
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const response = await supertest(app.server)
            .post('/login')
            .send({
                email: 'advisor@example.com',
                password: 'wrongpassword',
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            message: 'Incorrect password',
        });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid input (e.g., missing email)', async () => {
        const response = await supertest(app.server)
            .post('/login')
            .send({
                password: 'password123', // Email ausente
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('email'); // Verifica se o erro é sobre o campo 'email'
        expect(response.body.message).toContain('required');
    });
});
