export const storeBussinessHourQueryKeys = {
  all: ['store-business-hour'] as const,
  lists: () => [...storeBussinessHourQueryKeys.all, 'list'] as const,
};
