import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import type { PrismaClient } from '@/generated/prisma/client.js';

import { auth } from '@/lib/auth.js';
import { withPrisma } from '@/lib/prisma.js';
import listRouter from './routes/lists.js';

type AppVariables = {
  prisma: PrismaClient;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export const app = new Hono<{ Variables: AppVariables }>();

app.use('*', withPrisma);

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  await next();
});

app.use('/api/*', cors({
  origin: ['http://localhost:8081', 'exp://*'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/api/auth/session', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return c.json(c.get('session'));
});

app.post('/api/register', async (c) => {
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

app.use('/api/lists/*', async (c, next) => {
  if (!c.get('user')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.route('/api/lists', listRouter);

serve(app);