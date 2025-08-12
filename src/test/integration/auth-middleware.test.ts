import { authAccess } from '../../middlewares/auth-middleware';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('Auth Middleware Unit Tests', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        // Mock do objeto de request do Fastify
        mockRequest = {
            // A função que o fastify-jwt adiciona. Nós a mockamos.
            jwtVerify: jest.fn(),
        };
        // Mock do objeto de reply do Fastify
        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('should return 401 if jwtVerify fails (token invalid or missing)', async () => {
        // Simula o erro que o fastify-jwt lança quando o token é inválido
        (mockRequest.jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid Token'));

        const middleware = authAccess(['advisor']);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token.' });
    });

    it('should return 403 if user does not have the required role', async () => {
        const decodedToken = { id: 'user-1', email: 'viewer@test.com', roles: ['viewer'] };
        (mockRequest.jwtVerify as jest.Mock).mockResolvedValue(decodedToken);

        // A rota exige 'advisor', mas o usuário só tem 'viewer'
        const middleware = authAccess(['advisor']);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.code).toHaveBeenCalledWith(403);
        expect(mockReply.send).toHaveBeenCalledWith({ error: "Forbidden: You do not have the required role to access this resource." });
    });
    
    it('should proceed if user has exactly the required role', async () => {
        const decodedToken = { id: 'user-2', email: 'advisor@test.com', roles: ['advisor'] };
        (mockRequest.jwtVerify as jest.Mock).mockResolvedValue(decodedToken);
        
        const middleware = authAccess(['advisor']);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
        
        // Se a permissão for concedida, o middleware não deve enviar uma resposta
        expect(mockReply.code).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        
        // Verifica se os dados do usuário foram anexados ao request
        expect(mockRequest.user).toEqual(decodedToken);
    });

    it('should proceed if user has one of the multiple allowed roles', async () => {
        const decodedToken = { id: 'user-3', email: 'viewer@test.com', roles: ['viewer'] };
        (mockRequest.jwtVerify as jest.Mock).mockResolvedValue(decodedToken);

        // A rota permite 'advisor' ou 'viewer', e o usuário é 'viewer'
        const middleware = authAccess(['advisor', 'viewer']);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.code).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        expect(mockRequest.user).toEqual(decodedToken);
    });

    it('should return 403 if user has no roles', async () => {
        const decodedToken = { id: 'user-4', email: 'norole@test.com', roles: [] };
        (mockRequest.jwtVerify as jest.Mock).mockResolvedValue(decodedToken);
        
        const middleware = authAccess(['advisor']);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
        
        expect(mockReply.code).toHaveBeenCalledWith(403);
        expect(mockReply.send).toHaveBeenCalledWith({ error: "Forbidden: You do not have the required role to access this resource." });
    });
});
