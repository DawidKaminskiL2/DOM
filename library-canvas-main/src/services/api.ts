import axios from 'axios';

const API_BASE_URL = 'http://domki.me:8000/books/';

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description: string;
}

export interface BookCreate {
  title: string;
  author: string;
  year: number;
  description: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/');
    return response.data;
  },

  getOne: async (id: number): Promise<Book> => {
    const response = await api.get<Book>(`/${id}`);
    return response.data;
  },

  create: async (book: BookCreate): Promise<Book> => {
    const response = await api.post<Book>('/', book);
    return response.data;
  },

  update: async (id: number, book: BookCreate, authHeader: string): Promise<Book> => {
    const response = await api.put<Book>(`/${id}`, book, {
      headers: { Authorization: authHeader },
    });
    return response.data;
  },

  delete: async (id: number, authHeader: string): Promise<void> => {
    await api.delete(`/${id}`, {
      headers: { Authorization: authHeader },
    });
  },
};

export const authService = {
  register: async (username: string, password: string): Promise<void> => {
    await api.post('/register', { username, password });
  },

  // Verify credentials by trying to access a protected endpoint
  verifyCredentials: async (username: string, password: string): Promise<boolean> => {
    try {
      const token = btoa(`${username}:${password}`);
      // We'll just check if the credentials work by getting the book list
      // In a real scenario, you'd have a dedicated verify endpoint
      await api.get('/', {
        headers: { Authorization: `Basic ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  },
};
