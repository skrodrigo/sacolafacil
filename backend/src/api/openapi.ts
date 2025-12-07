import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { PrismaClient } from '@/generated/prisma/client.js';
import { auth } from '@/common/auth.js';

type AppVariables = {
  prisma: PrismaClient;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export const openapi = new OpenAPIHono<{ Variables: AppVariables }>();

openapi.get('/swagger', swaggerUI({ url: '/docs' }));

openapi.doc('/docs', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Listinha API',
    description: 'API para gerenciar listas de compras com orçamento',
    contact: {
      name: 'Listinha Support',
      url: 'https://github.com/skrodrigo/listinha',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development',
    },
    {
      url: 'https://api.listinha.com',
      description: 'Production',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Endpoints de autenticação',
    },
    {
      name: 'Lists',
      description: 'Endpoints de listas de compras',
    },
    {
      name: 'Items',
      description: 'Endpoints de itens da lista',
    },
  ],
});

export default openapi;
