import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { listService } from './../services/list.service.js';
import { ListSchema, CreateListSchema, UpdateListSchema, ListItemSchema, CreateListItemSchema, UpdateListItemSchema } from './../dtos/lists.dto.js';
import { ErrorSchema } from './../dtos/errors.dto.js';
import type { AppVariables } from './routes.js';

const lists = new OpenAPIHono<{ Variables: AppVariables }>();

const getListsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Lists'],
  responses: {
    200: { description: 'Get all lists', content: { 'application/json': { schema: z.array(ListSchema) } } },
  },
});

const createListRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Lists'],
  request: { body: { content: { 'application/json': { schema: CreateListSchema } } } },
  responses: {
    201: { description: 'List created', content: { 'application/json': { schema: ListSchema } } },
  },
});

const getListByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Lists'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Get a list', content: { 'application/json': { schema: ListSchema } } },
    404: { description: 'List not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

const updateListRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Lists'],
  request: { params: z.object({ id: z.string() }), body: { content: { 'application/json': { schema: UpdateListSchema } } } },
  responses: {
    200: { description: 'List updated', content: { 'application/json': { schema: ListSchema } } },
    404: { description: 'List not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

const deleteListRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Lists'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'List deleted', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'List not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

lists.openapi(getListsRoute, async (c) => {
  const user = c.get('user');
  const lists = await listService.getAllListsForUser(user!.id);
  return c.json(lists, 200);
});

lists.openapi(createListRoute, async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const newList = await listService.createList(user!.id, body);
  return c.json(newList, 201);
});

lists.openapi(getListByIdRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  try {
    const list = await listService.getListById(user!.id, id);
    return c.json(list, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

lists.openapi(updateListRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = c.req.valid('json');
  try {
    const updatedList = await listService.updateList(user!.id, id, body);
    return c.json(updatedList, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

lists.openapi(deleteListRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  try {
    await listService.deleteList(user!.id, id);
    return c.json({ success: true }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

const addItemRoute = createRoute({
  method: 'post',
  path: '/{id}/items',
  tags: ['Items'],
  request: { params: z.object({ id: z.string() }), body: { content: { 'application/json': { schema: CreateListItemSchema } } } },
  responses: {
    201: { description: 'Item created', content: { 'application/json': { schema: ListItemSchema } } },
    404: { description: 'List not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

const updateItemRoute = createRoute({
  method: 'patch',
  path: '/{listId}/items/{itemId}',
  tags: ['Items'],
  request: { params: z.object({ listId: z.string(), itemId: z.string() }), body: { content: { 'application/json': { schema: UpdateListItemSchema } } } },
  responses: {
    200: { description: 'Item updated', content: { 'application/json': { schema: ListItemSchema } } },
    404: { description: 'Item or list not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/{listId}/items/{itemId}',
  tags: ['Items'],
  request: { params: z.object({ listId: z.string(), itemId: z.string() }) },
  responses: {
    200: { description: 'Item deleted', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'Item or list not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

lists.openapi(addItemRoute, async (c) => {
  const user = c.get('user');
  const { id: listId } = c.req.param();
  const body = c.req.valid('json');
  try {
    const newItem = await listService.addItemToList(user!.id, listId, body);
    return c.json(newItem, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

lists.openapi(updateItemRoute, async (c) => {
  const user = c.get('user');
  const { listId, itemId } = c.req.param();
  const body = c.req.valid('json');
  try {
    const updatedItem = await listService.updateListItem(user!.id, listId, itemId, body);
    return c.json(updatedItem, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

lists.openapi(deleteItemRoute, async (c) => {
  const user = c.get('user');
  const { listId, itemId } = c.req.param();
  try {
    await listService.deleteListItem(user!.id, listId, itemId);
    return c.json({ success: true }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
});

export default lists;
