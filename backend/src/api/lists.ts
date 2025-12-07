import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { ListSchema, CreateListSchema, UpdateListSchema, ListItemSchema, CreateListItemSchema, UpdateListItemSchema, ErrorSchema } from '@/models/schemas.js';
import * as c from './lists.controller.js';

const lists = new OpenAPIHono();

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

lists.openapi(getListsRoute, c.getAllListsController);
lists.openapi(createListRoute, c.createListController);
lists.openapi(getListByIdRoute, c.getListByIdController);
lists.openapi(updateListRoute, c.updateListController);
lists.openapi(deleteListRoute, c.deleteListController);

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

lists.openapi(addItemRoute, c.addItemController);
lists.openapi(updateItemRoute, c.updateItemController);
lists.openapi(deleteItemRoute, c.deleteItemController);

export default lists;
