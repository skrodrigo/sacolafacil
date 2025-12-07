import { listRepository } from '@/repositories/lists.repository';
import type { CreateListData, UpdateListData, CreateListItemData, UpdateListItemData } from '@/dtos/lists.dto';

class ListService {
  async getAllListsForUser(userId: string) {
    return listRepository.findManyByUserId(userId);
  }

  async createList(userId: string, data: CreateListData) {
    return listRepository.create(userId, data);
  }

  async getListById(userId: string, listId: string) {
    const list = await listRepository.findById(userId, listId);
    if (!list) throw new Error('List not found or does not belong to user');
    return list;
  }

  async updateList(userId: string, listId: string, data: UpdateListData) {
    await this.getListById(userId, listId);
    return listRepository.update(listId, data);
  }

  async deleteList(userId: string, listId: string) {
    await this.getListById(userId, listId);
    return listRepository.delete(listId);
  }

  async addItemToList(userId: string, listId: string, data: CreateListItemData) {
    await this.getListById(userId, listId);
    return listRepository.createItem(listId, data);
  }

  async updateListItem(userId: string, listId: string, itemId: string, data: UpdateListItemData) {
    await this.getListById(userId, listId);
    const item = await listRepository.findItemById(listId, itemId);
    if (!item) throw new Error('Item not found in the specified list');
    return listRepository.updateItem(itemId, data);
  }

  async deleteListItem(userId: string, listId: string, itemId: string) {
    await this.getListById(userId, listId);
    const item = await listRepository.findItemById(listId, itemId);
    if (!item) throw new Error('Item not found in the specified list');
    return listRepository.deleteItem(itemId);
  }
}

export const listService = new ListService();
