import { Context } from 'hono';
import * as listService from '@/services/list.service.js';


export async function getAllListsController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const lists = await listService.getAllListsForUser(prisma, user!.id);
  return c.json(lists, 200);
}

export async function createListController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const body = await c.req.json();
  const newList = await listService.createList(prisma, user!.id, body);
  return c.json(newList, 201);
}

export async function getListByIdController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const list = await listService.getListById(prisma, user!.id, id);
  if (!list) return c.json({ error: 'List not found' }, 404);
  return c.json(list, 200);
}

export async function updateListController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const body = await c.req.json();
  const updatedList = await listService.updateList(prisma, user!.id, id, body);
  if (!updatedList) return c.json({ error: 'List not found' }, 404);
  return c.json(updatedList, 200);
}

export async function deleteListController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id } = c.req.param();
  const result = await listService.deleteList(prisma, user!.id, id);
  if (!result) return c.json({ error: 'List not found' }, 404);
  return c.json({ success: true }, 200);
}

export async function addItemController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { id: listId } = c.req.param();
  const body = await c.req.json();
  const newItem = await listService.addItemToList(prisma, user!.id, listId, body);
  if (!newItem) return c.json({ error: 'List not found' }, 404);
  return c.json(newItem, 201);
}

export async function updateItemController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { listId, itemId } = c.req.param();
  const body = await c.req.json();
  const updatedItem = await listService.updateListItem(prisma, user!.id, listId, itemId, body);
  if (!updatedItem) return c.json({ error: 'Item or list not found' }, 404);
  return c.json(updatedItem, 200);
}

export async function deleteItemController(c: Context) {
  const user = c.get('user');
  const prisma = c.get('prisma');
  const { listId, itemId } = c.req.param();
  const result = await listService.deleteListItem(prisma, user!.id, listId, itemId);
  if (!result) return c.json({ error: 'Item or list not found' }, 404);
  return c.json({ success: true }, 200);
}
