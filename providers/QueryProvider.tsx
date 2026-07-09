'use client';

import { ApiClientError } from '@/axios';
import { useAuthStore } from '@/modules/auth/store';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { PATHNAME } from '@/utils/consts/pathname.const';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return ERROR_MESSAGES.DEFAULT;
};

const shouldToastError = (error: unknown) => {
  if (error instanceof ApiClientError && error.status === 401) {
    return false;
  }

  if (error instanceof ApiClientError && error.code === 'INCORRECT_INPUT') {
    return false;
  }

  return true;
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [queryClient] = useState(() => {
    let lastUnauthorizedAt = 0;

    const handleUnauthorized = (error: unknown) => {
      if (!(error instanceof ApiClientError) || error.status !== 401) return false;

      useAuthStore.getState().clearAuth();

      const now = Date.now();
      if (now - lastUnauthorizedAt > 2000) {
        lastUnauthorizedAt = now;
        toast.error(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);

        const redirect =
          typeof window === 'undefined' ? undefined : `${window.location.pathname}${window.location.search}`;
        const isAuthRoute = redirect === PATHNAME.AUTH || redirect?.startsWith(`${PATHNAME.AUTH}/`);
        const loginUrl =
          redirect && !isAuthRoute ? `${PATHNAME.AUTH}?redirect=${encodeURIComponent(redirect)}` : PATHNAME.AUTH;

        router.replace(loginUrl);
      }

      return true;
    };

    const handleQueryError = (error: unknown) => {
      if (handleUnauthorized(error)) return;

      if (shouldToastError(error)) {
        toast.error(getErrorMessage(error));
      }
    };

    return new QueryClient({
      queryCache: new QueryCache({
        onError: handleQueryError,
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          if (handleUnauthorized(error)) {
            return;
          }

          if (mutation.options.onError || !shouldToastError(error)) {
            return;
          }

          toast.error(getErrorMessage(error));
        },
      }),
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
            console.log({ failureCount, error });
            if (error instanceof ApiClientError && [401, 403].includes(error.status ?? 0)) {
              return false;
            }

            return failureCount < 1;
          },
          staleTime: 10 * 1000, // 10s
        },
        mutations: {
          retry: 0,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};



// 'use client';

// import { ApiClientError } from '@/axios';
// import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
// import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import React, { useState } from 'react';
// import { toast } from 'sonner';

// const getErrorMessage = (error: unknown) => {
//   if (error instanceof ApiClientError) return error.message;
//   if (error instanceof Error) return error.message;
//   return ERROR_MESSAGES.DEFAULT;
// };

// const shouldToastError = (error: unknown) => {
//   if (error instanceof ApiClientError && error.code === 'INCORRECT_INPUT') {
//     return false;
//   }

//   return true;
// };

// export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         queryCache: new QueryCache({
//           onError: (error) => {
//             if (shouldToastError(error)) {
//               toast.error(getErrorMessage(error));
//             }
//           },
//         }),
//         mutationCache: new MutationCache({
//           onError: (error, _variables, _context, mutation) => {
//             if (mutation.options.onError || !shouldToastError(error)) {
//               return;
//             }

//             toast.error(getErrorMessage(error));
//           },
//         }),
//         defaultOptions: {
//           queries: {
//             refetchOnWindowFocus: false,
//             retry: 1,
//           },
//           mutations: {
//             retry: 0,
//           },
//         },
//       }),
//   );

//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   );
// };
