export interface User {
  id: string;
  email: string;
}

export interface Session {
  id: string;
  expiresAt: string; // ISO date string
  userId: string;
  user: User;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  value: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  listId: string;
}

export interface List {
  id: string;
  name?: string | null;
  budget: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userId: string;
  items: ListItem[];
}
