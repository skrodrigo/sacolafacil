import { Hono } from 'hono';
import type { Context } from 'hono';
import type { PrismaClient } from '@/generated/prisma/client.js';
import { auth } from '@/lib/auth.js';

type AppVariables = {
  prisma: PrismaClient;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const listRouter = new Hono<{ Variables: AppVariables }>();

listRouter.get('/', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const lists = await prisma.list.findMany({
    where: { userId: user!.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(lists);
});

listRouter.post('/', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { name, budget } = await c.req.json();
  const list = await prisma.list.create({
    data: {
      name,
      budget,
      userId: user!.id,
    },
  });
  return c.json(list, 201);
});

listRouter.get('/:id', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const list = await prisma.list.findFirst({
    where: { id, userId: user!.id },
    include: { items: true },
  });
  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }
  return c.json(list);
});

listRouter.patch('/:id', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const { name, budget } = await c.req.json();
  const list = await prisma.list.updateMany({
    where: { id, userId: user!.id },
    data: { name, budget },
  });
  if (list.count === 0) {
    return c.json({ error: 'List not found' }, 404);
  }
  return c.json({ success: true });
});

listRouter.delete('/:id', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const list = await prisma.list.deleteMany({
    where: { id, userId: user!.id },
  });
  if (list.count === 0) {
    return c.json({ error: 'List not found' }, 404);
  }
  return c.json({ success: true });
});

listRouter.post('/:id/items', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id: listId } = c.req.param();
  const { name, quantity, value } = await c.req.json();

  const list = await prisma.list.findFirst({
    where: { id: listId, userId: user!.id },
  });

  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const item = await prisma.listItem.create({
    data: {
      name,
      quantity,
      value,
      listId,
    },
  });

  return c.json(item, 201);
});

listRouter.patch('/:listId/items/:itemId', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { listId, itemId } = c.req.param();
  const { name, quantity, value } = await c.req.json();

  const list = await prisma.list.findFirst({
    where: { id: listId, userId: user!.id },
  });

  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const item = await prisma.listItem.updateMany({
    where: { id: itemId, listId },
    data: { name, quantity, value },
  });

  if (item.count === 0) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json({ success: true });
});

listRouter.delete('/:listId/items/:itemId', async (c: Context<{ Variables: AppVariables }>) => {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { listId, itemId } = c.req.param();

  const list = await prisma.list.findFirst({
    where: { id: listId, userId: user!.id },
  });

  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const item = await prisma.listItem.deleteMany({
    where: { id: itemId, listId },
  });

  if (item.count === 0) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json({ success: true });
});

export default listRouter;

