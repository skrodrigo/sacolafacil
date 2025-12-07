import { Context } from 'hono';
import { listService } from '@/services/list.service.js';

export async function getAllListsController(c: Context) {
  const user = c.get('user');
  const lists = await listService.getAllListsForUser(user!.id);
  return c.json(lists, 200);
}

export async function createListController(c: Context) {
  const user = c.get('user');
  const body = await c.req.json();
  const newList = await listService.createList(user!.id, body);
  return c.json(newList, 201);
}

export async function getListByIdController(c: Context) {
  const user = c.get('user');
  const { id } = c.req.param();
  const list = await listService.getListById(user!.id, id);
  if (!list) return c.json({ error: 'List not found' }, 404);
  return c.json(list, 200);
}

export async function updateListController(c: Context) {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  const updatedList = await listService.updateList(user!.id, id, body);
  if (!updatedList) return c.json({ error: 'List not found' }, 404);
  return c.json(updatedList, 200);
}

export async function deleteListController(c: Context) {
  const user = c.get('user');
  const { id } = c.req.param();
  const result = await listService.deleteList(user!.id, id);
  if (!result) return c.json({ error: 'List not found' }, 404);
  return c.json({ success: true }, 200);
}

// --- List Item Controllers ---

export async function addItemController(c: Context) {
  const user = c.get('user');
  const { id: listId } = c.req.param();
  const body = await c.req.json();
  const newItem = await listService.addItemToList(user!.id, listId, body);
  if (!newItem) return c.json({ error: 'List not found' }, 404);
  return c.json(newItem, 201);
}

export async function updateItemController(c: Context) {
  const user = c.get('user');
  const { listId, itemId } = c.req.param();
  const body = await c.req.json();
  const updatedItem = await listService.updateListItem(user!.id, listId, itemId, body);
  if (!updatedItem) return c.json({ error: 'Item or list not found' }, 404);
  return c.json(updatedItem, 200);
}

export async function deleteItemController(c: Context) {
  const user = c.get('user');
  const { listId, itemId } = c.req.param();
  const result = await listService.deleteListItem(user!.id, listId, itemId);
  if (!result) return c.json({ error: 'Item or list not found' }, 404);
  return c.json({ success: true }, 200);
}
