import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userData?: {
      id: string;
    };
  }
}
