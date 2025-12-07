import { PrismaClient } from '@/generated/prisma/client.js';
import { prisma } from '@/common/prisma.js';

class ListService {
  constructor(private prisma: PrismaClient) { }

  async getAllListsForUser(userId: string) {
    return this.prisma.list.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  }

  async createList(userId: string, data: { name?: string; budget: number }) {
    return this.prisma.list.create({ data: { ...data, userId }, include: { items: true } });
  }

  async getListById(userId: string, listId: string) {
    return this.prisma.list.findFirst({ where: { id: listId, userId }, include: { items: true } });
  }

  async updateList(userId: string, listId: string, data: { name?: string; budget?: number }) {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return null;
    return this.prisma.list.update({ where: { id: listId }, data, include: { items: true } });
  }

  async deleteList(userId: string, listId: string) {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return null;
    return this.prisma.list.delete({ where: { id: listId } });
  }

  async addItemToList(userId: string, listId: string, data: { name: string; quantity: number; value: number }) {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return null;
    return this.prisma.listItem.create({ data: { ...data, listId } });
  }

  async updateListItem(userId: string, listId: string, itemId: string, data: { name?: string; quantity?: number; value?: number }) {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return null;
    return this.prisma.listItem.update({ where: { id: itemId, listId }, data });
  }

  async deleteListItem(userId: string, listId: string, itemId: string) {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return null;
    return this.prisma.listItem.delete({ where: { id: itemId, listId } });
  }
}

export const listService = new ListService(prisma);
