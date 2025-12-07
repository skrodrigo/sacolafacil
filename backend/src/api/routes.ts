import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { PrismaClient } from '@/generated/prisma/client.js';
import { auth } from '@/common/auth.js';
import listRouter from './lists.js';

type AppVariables = {
  prisma: PrismaClient;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const routes = new OpenAPIHono<{ Variables: AppVariables }>();

// --- Rotas da API ---
routes.route('/api/lists', listRouter);

// --- Rotas de Autenticação ---
routes.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));
routes.get('/api/auth/session', (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  return c.json(c.get('session'));
});
routes.post('/api/register', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);
  try {
    return await auth.api.signUpEmail({ body: { email, password, name: email.split('@')[0] }, asResponse: true });
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 400);
  }
});

// --- Documentação OpenAPI ---
routes.get('/swagger', swaggerUI({ url: '/docs' }));

routes.doc('/docs', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Listinha API',
    description: 'API para gerenciar listas de compras com orçamento',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Development' }],
  tags: [
    { name: 'Lists', description: 'Endpoints para listas de compras' },
    { name: 'Items', description: 'Endpoints para itens da lista' },
    { name: 'Auth', description: 'Endpoints de autenticação' },
  ],
});

export default routes;
