export const authQueryKeys = {
  all: ['auth'] as const,
  sessions: () => [...authQueryKeys.all, 'sessions'] as const,
};
