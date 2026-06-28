'use client';

import { deleteCookie } from 'cookies-next';
import { requestGetProfile, requestLogin, requestLogout } from './services';
import type { ILoginReq, IUser } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@/utils/consts/token.const';
import { PATHNAME } from '@/utils/consts/pathname.const';
import { clearHttpOnlyCookiesAction } from '@/app/actions/auth';

interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  permissions: string[];
  roles: string[];
  isLoading: boolean;
  error: string | null;
}

interface IAuthActions {
  login: (data: ILoginReq) => Promise<IUser>;
  logout: (redirect?: boolean, fetchLogout?: boolean) => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}
type IAuthStore = IAuthState & IAuthActions;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Co loi xay ra';
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],
      roles: [],

      login: async ({ email, password }: ILoginReq) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await requestLogin({ email, password });

          set({
            user: data.data.user,
            isAuthenticated: true,
            permissions: data.data.user.permissions,
            roles: data.data.user.roles,
            isLoading: false,
            error: null,
          });

          return data.data.user;
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
            isAuthenticated: false,
            user: null,
            permissions: [],
            roles: [],
          });
          throw error;
        }
      },

      logout: async (redirect = true, fetchLogout = true) => {
        set({ isLoading: true, error: null });
        try {
          if (fetchLogout) {
            await requestLogout();
          }
          deleteCookie(AUTH_ACCESS_COOKIE);
          deleteCookie(AUTH_REFRESH_COOKIE);
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            permissions: [],
            roles: [],
          });
          if (redirect) {
            window.location.href = PATHNAME.AUTH;
          }
        } catch (error) {
          set({ error: getErrorMessage(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await requestGetProfile();
          const user = response.data.data;

          set({
            user,
            isAuthenticated: true,
            permissions: user.permissions,
            roles: user.roles,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('[Auth] Failed to fetch profile:', error);
          get().clearAuth();
          set({ error: getErrorMessage(error) });

          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearAuth: () => {
        clearHttpOnlyCookiesAction();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          permissions: [],
          roles: [],
        });
      },
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
