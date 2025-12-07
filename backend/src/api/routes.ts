import { OpenAPIHono } from '@hono/zod-openapi';
import type { PrismaClient } from '@/generated/prisma/client.js';
import listRouter from './lists.js';
import openapi from './openapi.js';
import { auth } from '@/common/auth.js';

type AppVariables = {
  prisma: PrismaClient;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const routes = new OpenAPIHono<{ Variables: AppVariables }>();

routes.route('/', openapi);

routes.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

routes.get('/api/auth/session', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return c.json(c.get('session'));
});

routes.post('/api/register', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }
  try {
    const user = await auth.api.signUpEmail({
      body: { email, password, name: email.split('@')[0] },
      asResponse: true,
    });
    return user;
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 400);
  }
});

routes.route('/api/lists', listRouter);

export default routes;
