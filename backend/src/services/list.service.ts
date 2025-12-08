import { listRepository } from './../repositories/lists.repository.js';
import type { CreateListData, UpdateListData, CreateListItemData, UpdateListItemData } from './../dtos/lists.dto.js';
import PDFDocument from 'pdfkit';

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

  async exportListToPdf(userId: string, listId: string): Promise<Buffer> {
    const list = await this.getListById(userId, listId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      doc.fontSize(25).text(list.name ?? 'Lista sem nome', { align: 'center' });
      doc.moveDown();

      list.items.forEach(item => {
        doc.fontSize(12).text(`${item.quantity}x ${item.name} - ${item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
      });

      doc.end();
    });
  }
}

export const listService = new ListService();
