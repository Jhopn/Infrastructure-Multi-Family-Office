import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    clientData?: {
      id: string;
    };
  }
}
