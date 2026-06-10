'use client';

import { requestGetProfile, requestLogin, requestLogout, requestUpdateProfile } from '@/services/auth';
import type { ILoginReq, IUpdateProfileReq } from '@/types/aurh';
import type { IUser } from '@/types/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  roles: string[];
  setUser: (user: IUser | null) => void;
  clearAuth: () => void;
  login: (data: ILoginReq) => Promise<IUser>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;

  updateProfile: (data: Partial<IUpdateProfileReq>) => Promise<IUser>;

  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

type PersistedAuthStore = Pick<AuthStore, 'user' | 'isAuthenticated' | 'permissions' | 'roles'>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Co loi xay ra';
}

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore, [], [], PersistedAuthStore>(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],
      roles: [],

      setUser: (user) => {
        set({
          user,
          isAuthenticated: Boolean(user),
          permissions: user?.permissions ?? [],
          roles: user?.roles ?? [],
          error: null,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
          error: null,
        });
        window.location.href = '/auth';
      },

      login: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await requestLogin(data);
          const user = response.data.data.user;

          get().setUser(user);
          return user;
        } catch (error) {
          set({ error: getErrorMessage(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await requestLogout();
        } catch (error) {
          set({ error: getErrorMessage(error) });
        } finally {
          get().clearAuth();
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await requestGetProfile();
          const user = response.data.data;

          get().setUser(user);
        } catch (error) {
          get().clearAuth();
          set({ error: getErrorMessage(error) });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await requestUpdateProfile(data);
          const user = response.data.data;

          get().setUser(user);
          return user;
        } catch (error) {
          set({ error: getErrorMessage(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      hasPermission: (permission) => get().permissions.includes(permission),

      hasAnyPermission: (permissions) => permissions.some((permission) => get().permissions.includes(permission)),
    }),
    {
      name: 'rental-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
      }),
    },
  ),
);
