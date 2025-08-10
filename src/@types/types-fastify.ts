import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userData?: {
      id: string;
      email: string;
      roles: string[];
    };
  }
}
