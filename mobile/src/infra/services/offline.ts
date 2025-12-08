import * as FileSystem from 'expo-file-system';
import { List } from '@/types';

const fileUri = (FileSystem as any).documentDirectory + 'lists.json';

async function getLists(): Promise<List[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(fileUri);
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to get offline lists', error);
    return [];
  }
}

async function saveLists(lists: List[]): Promise<void> {
  try {
    const content = JSON.stringify(lists, null, 2);
    await FileSystem.writeAsStringAsync(fileUri, content);
  } catch (error) {
    console.error('Failed to save offline lists', error);
  }
}

async function getAll(): Promise<List[]> {
  return await getLists();
}

async function create(data: { name: string; budget: number }): Promise<List> {
  const lists = await getLists();
  const newList: List = {
    id: `offline-${Date.now()}`,
    name: data.name,
    budget: data.budget,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isOffline: true,
  };
  lists.push(newList);
  await saveLists(lists);
  return newList;
}

async function getById(id: string): Promise<List | null> {
  const lists = await getLists();
  const list = lists.find((l) => l.id === id);
  return list || null;
}

async function update(id: string, data: Partial<List>): Promise<List | null> {
  const lists = await getLists();
  const index = lists.findIndex((l) => l.id === id);
  if (index === -1) {
    return null;
  }
  const updatedList = { ...lists[index], ...data, updatedAt: new Date().toISOString() };
  lists[index] = updatedList;
  await saveLists(lists);
  return updatedList;
}

export const offlineListService = {
  getAll,
  create,
  getById,
  update,
};
