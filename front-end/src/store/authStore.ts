import { create } from 'zustand';
import { authApi } from '../lib/auth/client';
import type { ClientSession } from '../types/auth';

/**
 * Client-side cache of the server session (the httpOnly cookie is the source of truth).
 * Deliberately NOT persisted: it is re-fetched from /api/auth/me on every page load,
 * so it can never drift from the real cookie and causes no hydration mismatch.
 */
interface AuthState {
  status: 'loading' | 'ready';
  session: ClientSession | null;
  setSession: (s: ClientSession | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  setSession: (session) => set({ session, status: 'ready' }),
  refresh: async () => {
    const session = await authApi.me();
    set({ session, status: 'ready' });
  },
  logout: async () => {
    await authApi.logout();
    set({ session: null, status: 'ready' });
  },
}));
