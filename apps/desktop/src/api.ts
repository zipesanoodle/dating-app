import { createTRPCClient, httpBatchLink, splitLink, wsLink, createWSClient } from '@trpc/client';
import type { AppRouter } from '../../api/src/router';

const API_URL = 'http://localhost:3001/trpc';
const WS_URL = 'ws://localhost:3001';

const wsClient = createWSClient({
  url: WS_URL,
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : undefined,
    };
  },
});

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpBatchLink({
        url: API_URL,
        headers: () => {
          const token = localStorage.getItem('token');
          return {
            Authorization: token ? `Bearer ${token}` : undefined,
          };
        },
      }),
    }),
  ],
});

export interface Profile {
  _id: string;
  userId: string;
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

  swipe: (toUserId: string, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> =>
    trpc.discovery.swipe.mutate({ toUserId, direction }),
    
  getMe: async (): Promise<Profile | null> => {
    const profile = await trpc.profile.getMe.query();
    return profile as unknown as Profile;
  },
  
  updateProfile: (data: Partial<Profile>) =>
    trpc.profile.updateProfile.mutate(data),

  getMatches: () => trpc.chat.getMatches.query(),
  getMessages: (matchId: string) => trpc.chat.getMessages.query({ matchId }),
  sendMessage: (matchId: string, content: string) => trpc.chat.sendMessage.mutate({ matchId, content }),
  onMessage: (matchId: string, onData: (data: any) => void) => 
    trpc.chat.onMessage.subscribe({ matchId }, { onData }),
  onNewMessageGlobal: (onData: (data: any) => void) =>
    trpc.chat.onNewMessageGlobal.subscribe(undefined, { onData }),
};
