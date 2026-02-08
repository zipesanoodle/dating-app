const API_URL = 'http://localhost:3001';

export interface Profile {
  id: number;
  userId: number;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
  interests?: string[];
}

export const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.reload();
      }
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  login: (email: string, password: string) => 
    api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getDiscovery: (): Promise<Profile[]> => 
    api.request('/discovery'),

  swipe: (toUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> =>
    api.request('/swipe', {
      method: 'POST',
      body: JSON.stringify({ toUserId, direction }),
    }),
};
