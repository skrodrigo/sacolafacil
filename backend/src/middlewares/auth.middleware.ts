import { prisma } from './../common/prisma.js';
import { env } from './../common/env.js';
import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw new HTTPException(401, { message: 'Invalid user' });
    }

    const { password: _, ...userWithoutPassword } = user;
    c.set('user', userWithoutPassword);

    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid or expired token', cause: error });
  }
}
