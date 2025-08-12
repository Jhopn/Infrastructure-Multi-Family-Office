import { loginUser } from '../../controllers/user-controller/user-controller'; 
import { prisma } from '../../connection/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';


jest.mock('../../connection/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

// Mock das dependências
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('Auth Controller - loginUser', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        mockRequest = {
            body: {
                email: 'advisor@example.com',
                password: 'password123',
            },
        };
        mockReply = {
            code: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
        // Define a variável de ambiente para o teste
        process.env.JWT_SECRET = 'test-secret';
    });

    it('should return 200 and a token for successful authentication', async () => {
        const mockUser = {
            id: 'user-uuid-123',
            email: 'advisor@example.com',
            passwordHash: 'hashedpassword',
            UserAccess: [{ Access: { name: 'advisor' } }],
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');

        await loginUser(mockRequest as any, mockReply as any);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'advisor@example.com' },
            include: { UserAccess: { include: { Access: true } } },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: mockUser.id,
                email: mockUser.email,
                roles: ['advisor'],
            },
            'test-secret',
            { expiresIn: '8h' }
        );
        expect(mockReply.status).toHaveBeenCalledWith(200);
        expect(mockReply.send).toHaveBeenCalledWith({
            userId: mockUser.id,
            token: 'mocked-jwt-token',
        });
    });

    it('should return 401 if user not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await loginUser(mockRequest as any, mockReply as any);

        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Authentication failed, user not found.',
        });
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 401 for an incorrect password', async () => {
        const mockUser = {
            id: 'user-uuid-123',
            email: 'advisor@example.com',
            passwordHash: 'hashedpassword',
            UserAccess: [],
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await loginUser(mockRequest as any, mockReply as any);

        expect(mockReply.status).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Incorrect password',
        });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 401 for a general authentication failure', async () => {
        (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

        await loginUser(mockRequest as any, mockReply as any);

        expect(mockReply.status).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Authentication failure.',
            success: false,
        }));
    });
});
