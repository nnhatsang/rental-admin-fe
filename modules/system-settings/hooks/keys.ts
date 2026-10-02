export const systemSettingsQueryKeys = {
  all: ['system-settings'] as const,
  detail: () => [...systemSettingsQueryKeys.all, 'detail'] as const,
};
