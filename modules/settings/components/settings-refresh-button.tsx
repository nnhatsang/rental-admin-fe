import { IconRefresh } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

type SettingsRefreshButtonProps = {
  isFetching: boolean;
  onRefresh: () => void;
};

export function SettingsRefreshButton({ isFetching, onRefresh }: SettingsRefreshButtonProps) {
  return (
    <Button type="button" variant="outline" disabled={isFetching} onClick={onRefresh}>
      <IconRefresh className="mr-1.5 size-4" aria-hidden="true" />
      Làm mới
    </Button>
  );
}
