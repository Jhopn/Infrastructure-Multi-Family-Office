import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { GoalRoutes } from 'routes/goal-routes/goal-routes';
import { WalletRoutes } from 'routes/wallet-routes/wallet-routes';
import { IdealWalletRoutes } from 'routes/ideal-wallet-routes/ideal-wallet-routes';
import { InsuranceRoutes } from 'routes/insurance-routes/insurance-routes';
import { RetirementProfileRoutes } from 'routes/retirement-profile-routes/retirement-profile-routes';
import { NetWorthRoutes } from 'routes/net-worth-routes/net-worth-routes';
import { SimulationRoutes } from 'routes/simulation-routes/simulation-routes';
import { EventRoutes } from 'routes/event-routes/event-routes';
import { SessionRoutes } from './routes/auth-routes/auth-routes';
import { ClientRoutes } from './routes/client-routes/client-routes';
import { UserRoutes } from 'routes/user-routes/user-routes';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Multi Family Office API',
      description: 'API documentation for the Multi Family Office application',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

app.register(ClientRoutes);
app.register(SessionRoutes);
app.register(GoalRoutes);
app.register(WalletRoutes);
app.register(IdealWalletRoutes);
app.register(InsuranceRoutes);
app.register(RetirementProfileRoutes);
app.register(NetWorthRoutes);
app.register(SimulationRoutes);
app.register(EventRoutes);
app.register(UserRoutes);

app.listen({ port: 4000 }, (err, address) => {
  console.log(`Server is running at ${address} 🚀`);
});
