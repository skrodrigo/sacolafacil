import { PrismaClient } from './../generated/prisma/client.js';
import { prisma } from './../common/prisma.js';
import type { CreateListData, UpdateListData, CreateListItemData, UpdateListItemData } from './../dtos/lists.dto.js';

class ListRepository {
  constructor(private prisma: PrismaClient) { }

  async findManyByUserId(userId: string) {
    return this.prisma.list.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, data: CreateListData) {
    return this.prisma.list.create({ data: { ...data, userId }, include: { items: true } });
  }

  async findById(userId: string, listId: string) {
    return this.prisma.list.findFirst({ where: { id: listId, userId }, include: { items: true } });
  }

  async update(listId: string, data: UpdateListData) {
    return this.prisma.list.update({ where: { id: listId }, data, include: { items: true } });
  }

  async delete(listId: string) {
    return this.prisma.list.delete({ where: { id: listId } });
  }

  async createItem(listId: string, data: CreateListItemData) {
    return this.prisma.listItem.create({ data: { ...data, listId } });
  }

  async updateItem(itemId: string, data: UpdateListItemData) {
    return this.prisma.listItem.update({ where: { id: itemId }, data });
  }

  async deleteItem(itemId: string) {
    return this.prisma.listItem.delete({ where: { id: itemId } });
  }

  async findItemById(listId: string, itemId: string) {
    return this.prisma.listItem.findFirst({ where: { id: itemId, listId } });
  }

}

export const listRepository = new ListRepository(prisma);
