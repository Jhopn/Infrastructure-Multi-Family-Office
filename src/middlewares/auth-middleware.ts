import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { prisma } from '../connection/prisma';

interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
  roles: string[];
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

      request.clientData = { id: decodedToken.id, email: decodedToken.email, roles: decodedToken.roles};

      if (permissions && permissions.length > 0) {
        const user = await prisma.user.findUnique({
          where: {
            id: decodedToken.id,
          },
          include: {
            UserAccess: {
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

        if (!user) {
          return reply.code(403).send({ message: 'User not found.' });
        }

        const userPermissions = user.UserAccess.map((ca) => ca.Access?.name) ?? [];

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
