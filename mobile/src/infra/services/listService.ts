import { api } from '@/infra/api';
import { List, ListItem } from '@/types';

export const listService = {
  async getAll(): Promise<List[]> {
    const response = await api.get<List[]>('/api/lists');
    return response.data;
  },

  async getById(id: string): Promise<List> {
    const response = await api.get<List>(`/api/lists/${id}`);
    return response.data;
  },

  async create(data: { budget: number; name?: string }): Promise<List> {
    const response = await api.post<List>('/api/lists', data);
    return response.data;
  },

  async update(id: string, name?: string, budget?: number): Promise<void> {
    await api.patch(`/api/lists/${id}`, { name, budget });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/lists/${id}`);
  },

  async addItem(listId: string, name: string, quantity: number, value: number): Promise<ListItem> {
    const response = await api.post<ListItem>(`/api/lists/${listId}/items`, {
      name,
      quantity,
      value,
    });
    return response.data;
  },

  async updateItem(
    listId: string,
    itemId: string,
    name: string,
    quantity: number,
    value: number
  ): Promise<void> {
    await api.patch(`/api/lists/${listId}/items/${itemId}`, {
      name,
      quantity,
      value,
    });
  },

  async deleteItem(listId: string, itemId: string): Promise<void> {
    await api.delete(`/api/lists/${listId}/items/${itemId}`);
  },

  async exportPdf(listId: string): Promise<Blob> {
    const response = await api.get(`/api/lists/${listId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
