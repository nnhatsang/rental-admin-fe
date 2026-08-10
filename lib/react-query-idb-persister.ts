// lib/react-query-idb-persister.ts
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import { REACT_QUERY_PERSIST_CACHE_KEY } from './react-query-persist-config';

export const createIdbPersister = (): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(REACT_QUERY_PERSIST_CACHE_KEY, client);
    },

    restoreClient: async () => {
      return await get<PersistedClient>(REACT_QUERY_PERSIST_CACHE_KEY);
    },

    removeClient: async () => {
      await del(REACT_QUERY_PERSIST_CACHE_KEY);
    },
  };
};
