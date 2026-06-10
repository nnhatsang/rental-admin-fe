'use client';

import { ApiClientError } from '@/axios';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { toast } from 'sonner';

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
            if (shouldToastError(error)) {
              toast.error(getErrorMessage(error));
            }
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
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
