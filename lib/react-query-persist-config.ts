// lib/react-query-persist-config.ts
export const REACT_QUERY_PERSIST_CACHE_KEY = 'rental-admin-react-query-cache';

export const REACT_QUERY_PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

export const PERSISTED_QUERY_CONFIG = {
  'store-business-hour': {
    persist: true,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
    description: 'Store business hours for date-time picker',
  },

  // Sau này muốn cache thêm thì thêm ở đây
  // 'products': {
  //   persist: true,
  //   staleTime: 30 * 60 * 1000,
  //   gcTime: 24 * 60 * 60 * 1000,
  //   description: 'Products list cache',
  // },
} as const;

export type PersistedQueryRootKey = keyof typeof PERSISTED_QUERY_CONFIG;

export const getPersistedQueryConfig = (queryKey: readonly unknown[]) => {
  const rootKey = queryKey[0];

  if (typeof rootKey !== 'string') return undefined;

  return PERSISTED_QUERY_CONFIG[rootKey as PersistedQueryRootKey];
};

export const shouldPersistQuery = (queryKey: readonly unknown[]) => {
  const config = getPersistedQueryConfig(queryKey);

  return Boolean(config?.persist);
};
