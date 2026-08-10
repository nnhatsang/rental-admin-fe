'use client';

import { ApiClientError } from '@/axios';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { createIdbPersister } from '@/lib/react-query-idb-persister';
import { REACT_QUERY_PERSIST_MAX_AGE, shouldPersistQuery } from '@/lib/react-query-persist-config';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return ERROR_MESSAGES.DEFAULT;
};

const shouldToastError = (error: unknown) => {
  if (error instanceof ApiClientError && error.code === 'INCORRECT_INPUT') {
    return false;
  }

  return true;
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            // if (shouldToastError(error)) {
              toast.error(getErrorMessage(error));
            // }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.onError || !shouldToastError(error)) {
              return;
            }

            toast.error(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            // retry: 1,
            retry: (failureCount, error) => {
              if (error instanceof ApiClientError && [400, 401, 403, 404, 422].includes(error.status ?? 0)) {
                return false;
              }

              return failureCount < 1;
            },
            staleTime: 30_000, // 30s
            gcTime: 5 * 60_000, //5pUSER_LOCKED
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );
const [persister] = useState(() => createIdbPersister());
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: REACT_QUERY_PERSIST_MAX_AGE,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => shouldPersistQuery(query.queryKey),
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};

// 0s          30s                                5 phút
// │------------│-----------------------------------│
//   FRESH          STALE                        XÓA CACHE
