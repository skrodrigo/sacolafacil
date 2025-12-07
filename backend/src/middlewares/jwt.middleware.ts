import { auth } from '@/common/auth.js';
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';


export async function authMiddleware(c: Context, next: Next) {
  // Rotas públicas não precisam de autenticação
  if (c.req.path.startsWith('/api/auth') || c.req.path.startsWith('/swagger') || c.req.path.startsWith('/docs')) {
    return next();
  }

  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
      throw new HTTPException(401, { message: 'UNAUTHORIZED' });
    }
    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'UNAUTHORIZED', cause: error });
  }
}
