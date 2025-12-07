import { z } from '@hono/zod-openapi';

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: '123' }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
  })
  .openapi('User');

export const ListSchema = z
  .object({
    id: z.string().openapi({ example: '1' }),
    name: z.string().nullable().optional().openapi({ example: 'Compras do mês' }),
    budget: z.number().openapi({ example: 500.0 }),
    userId: z.string().openapi({ example: '123' }),
    items: z.array(z.any()).openapi({ example: [] }),
    createdAt: z.any().openapi({ example: '2024-01-01T00:00:00Z' }),
    updatedAt: z.any().openapi({ example: '2024-01-01T00:00:00Z' }),
  })
  .openapi('List');

export const ListItemSchema = z
  .object({
    id: z.string().openapi({ example: '1' }),
    name: z.string().openapi({ example: 'Pão' }),
    quantity: z.number().openapi({ example: 2 }),
    value: z.number().openapi({ example: 5.5 }),
    listId: z.string().openapi({ example: '1' }),
    createdAt: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updatedAt: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
  })
  .openapi('ListItem');

export const CreateListSchema = z
  .object({
    name: z.string().optional().openapi({ example: 'Compras do mês' }),
    budget: z.number().openapi({ example: 500.0 }),
  })
  .openapi('CreateList');

export const UpdateListSchema = z
  .object({
    name: z.string().optional().openapi({ example: 'Compras do mês' }),
    budget: z.number().optional().openapi({ example: 500.0 }),
  })
  .openapi('UpdateList');

export const CreateListItemSchema = z
  .object({
    name: z.string().openapi({ example: 'Pão' }),
    quantity: z.number().openapi({ example: 2 }),
    value: z.number().openapi({ example: 5.5 }),
  })
  .openapi('CreateListItem');

export const UpdateListItemSchema = z
  .object({
    name: z.string().optional().openapi({ example: 'Pão' }),
    quantity: z.number().optional().openapi({ example: 2 }),
    value: z.number().optional().openapi({ example: 5.5 }),
  })
  .openapi('UpdateListItem');

export const ErrorSchema = z
  .object({
    error: z.string().openapi({ example: 'Unauthorized' }),
  })
  .openapi('Error');
