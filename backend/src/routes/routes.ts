import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { PrismaClient } from '@/generated/prisma/client';
import { authMiddleware } from '@/middlewares/auth.middleware';
import listRouter from './lists.routes';
import authRouter from './auth.routes';
import type { User } from '@/generated/prisma/client';

export type AppVariables = {
  prisma: PrismaClient;
  user: Omit<User, 'password'> | null;
};

const app = new OpenAPIHono<{ Variables: AppVariables }>();

app.get('/', (c) => c.json({ message: 'Listinha API up and running!' }));

// Rotas públicas de autenticação
app.route('/api/auth', authRouter);

// Rotas protegidas
const protectedApi = new OpenAPIHono<{ Variables: AppVariables }>();
protectedApi.use('*', authMiddleware);
protectedApi.route('/lists', listRouter);

// Monta o roteador protegido
app.route('/api', protectedApi);

app.doc('/docs', {
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

app.get('/swagger', swaggerUI({ url: '/docs' }));

export default app;
