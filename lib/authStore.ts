import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  timezone?: string;
  skills?: Array<{ name: string; level: string }>;
  passions?: string[];
  wantsToLearn?: string[];
  hoursPerWeek?: number;
  remoteOnly?: boolean;
  profileVisibility?: string;
  socialLinks?: Record<string, string>;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        // Remove tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);