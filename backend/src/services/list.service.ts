import { PrismaClient } from '@/generated/prisma/client.js';

export async function getAllListsForUser(prisma: PrismaClient, userId: string) {
  return prisma.list.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
}

export async function createList(prisma: PrismaClient, userId: string, data: { name?: string; budget: number }) {
  return prisma.list.create({ data: { ...data, userId }, include: { items: true } });
}

export async function getListById(prisma: PrismaClient, userId: string, listId: string) {
  return prisma.list.findFirst({ where: { id: listId, userId }, include: { items: true } });
}

export async function updateList(prisma: PrismaClient, userId: string, listId: string, data: { name?: string; budget?: number }) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return null;
  return prisma.list.update({ where: { id: listId }, data, include: { items: true } });
}

export async function deleteList(prisma: PrismaClient, userId: string, listId: string) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return null;
  return prisma.list.delete({ where: { id: listId } });
}

export async function addItemToList(prisma: PrismaClient, userId: string, listId: string, data: { name: string; quantity: number; value: number }) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return null;
  return prisma.listItem.create({ data: { ...data, listId } });
}

export async function updateListItem(prisma: PrismaClient, userId: string, listId: string, itemId: string, data: { name?: string; quantity?: number; value?: number }) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return null;
  return prisma.listItem.update({ where: { id: itemId, listId }, data });
}

export async function deleteListItem(prisma: PrismaClient, userId: string, listId: string, itemId: string) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return null;
  return prisma.listItem.delete({ where: { id: itemId, listId } });
}
