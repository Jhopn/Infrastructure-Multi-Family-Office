import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { prisma } from '../connection/prisma';

interface DecodedToken extends JwtPayload {
  clientId?: string;
}

export function authAccess(permissions?: string[]) {
  return async (request: any, reply: any) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply
          .code(401)
          .send({ msg: 'Authentication failed, token missing!' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      request.clientData = { id: decodedToken.clientId };

      if (permissions && permissions.length > 0) {
        const client = await prisma.client.findUnique({
          where: {
            id: decodedToken.clientId,
          },
          include: {
            ClientAccess: {
              select: {
                Access: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!client) {
          return reply.code(403).send({ message: 'Client not found.' });
        }

        const userPermissions =
          client.ClientAccess.map((ca) => ca.Access?.name) ?? [];

        const hasPermission = permissions.some((p) =>
          userPermissions.includes(p),
        );

        if (!hasPermission) {
          return reply.code(403).send({ message: 'Permission denied.' });
        }
      }

      return;
    } catch (error) {
      return reply
        .code(401)
        .send({ msg: 'Authentication failed, invalid token!' });
    }
  };
}
