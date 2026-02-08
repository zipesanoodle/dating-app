import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../api/src/router';

const API_URL = 'http://localhost:3001/trpc';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      headers: () => {
        const token = localStorage.getItem('token');
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

export interface Profile {
  id: number;
  userId: number;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
  interests?: string[];
}

// Legacy API wrapper to minimize changes in components, 
// but redirected to tRPC
export const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  login: async (email: string, password: string) => {
    const result = await trpc.auth.login.mutate({ email, password });
    if (result.token) {
      api.setToken(result.token);
    }
    return result;
  },

  register: (email: string, password: string) =>
    trpc.auth.register.mutate({ email, password }),

  getDiscovery: async (): Promise<Profile[]> => {
    const profiles = await trpc.discovery.getDiscovery.query();
    return profiles as unknown as Profile[];
  },

  swipe: (toUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> =>
    trpc.discovery.swipe.mutate({ toUserId, direction }),
    
  getMe: async (): Promise<Profile | null> => {
    const profile = await trpc.discovery.getMe.query();
    return profile as unknown as Profile;
  },
  
  updateProfile: (data: any) =>
    trpc.discovery.updateProfile.mutate(data),
};
