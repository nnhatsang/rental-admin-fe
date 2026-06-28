'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAuthStore } from '@/modules/auth/store';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { NavGroup, NavMainItem } from './types';
import { filterSidebarItemsByPermissions, modKeyLabel } from '@/lib/utils';
import { sidebarItems } from '@/utils/consts/sidebar.const';
import { useHotkey } from '@tanstack/react-hotkeys';
import { Kbd } from '../ui/kbd';

type SearchItem = {
  group: string;
  label: string;
  url: string;
  icon?: NavMainItem['icon'];
  disabled?: boolean;
  newTab?: boolean;
};

const getSubItemGroup = (groupLabel: string | undefined, itemTitle: string, sidebarGroupLabels: Set<string>) => {
  return sidebarGroupLabels.has(itemTitle) ? (groupLabel ?? 'Other') : itemTitle;
};

const buildSearchItems = (items: NavGroup[]): SearchItem[] => {
  const sidebarGroupLabels = new Set(items.flatMap((group) => (group.label ? [group.label] : [])));

  return items.flatMap((group) =>
    group.items.flatMap((item) => {
      if (item.subItems) {
        return item.subItems.map((sub) => ({
          group: getSubItemGroup(group.label, item.title, sidebarGroupLabels),
          label: sub.title,
          url: sub.url,
          icon: item.icon,
          disabled: sub.comingSoon,
          newTab: sub.newTab,
        }));
      }

      return [
        {
          group: group.label ?? 'Other',
          label: item.title,
          url: item.url,
          icon: item.icon,
          disabled: item.comingSoon,
          newTab: item.newTab,
        },
      ];
    }),
  );
};

const getAvailableItems = (items: SearchItem[]) => {
  return items.filter((item) => !item.disabled && !item.url.includes('coming-soon'));
};

const groupBy = (items: SearchItem[]) => {
  const groups = [...new Set(items.map((item) => item.group))];

  return groups.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  }));
};

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const visibleSidebarItems = React.useMemo(
    () => filterSidebarItemsByPermissions(sidebarItems, permissions),
    [permissions],
  );
  const searchItems = React.useMemo(() => buildSearchItems(visibleSidebarItems), [visibleSidebarItems]);
  const recommendations = React.useMemo(() => getAvailableItems(searchItems), [searchItems]);

  // React.useEffect(() => {
  //   const down = (event: KeyboardEvent) => {
  //     if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
  //       event.preventDefault();
  //       setOpen((prev) => !prev);
  //     }
  //   };

  //   document.addEventListener('keydown', down);

  //   return () => document.removeEventListener('keydown', down);
  // }, []);

  useHotkey('Mod+J', () => {
    setOpen((prev) => !prev);
  });

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setQuery('');
  };

  const handleSelect = (item: SearchItem) => {
    if (item.disabled) return;

    handleOpenChange(false);

    if (item.newTab) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(item.url);
  };

  const renderGroups = (items: SearchItem[]) =>
    groupBy(items).map(({ group, items: groupItems }, index) => (
      <React.Fragment key={group}>
        {index > 0 && <CommandSeparator />}
        <CommandGroup heading={group}>
          {groupItems.map((item) => (
            <CommandItem
              disabled={item.disabled}
              key={`${group}-${item.url}-${item.label}`}
              value={`${item.group} ${item.label}`}
              onSelect={() => handleSelect(item)}
            >
              {item.icon && <item.icon />}
              <span>{item.label}</span>
              {item.disabled && (
                <Badge variant="outline" className="text-xs">
                  Soon
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </React.Fragment>
    ));

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        variant="link"
        className="px-0! font-normal text-muted-foreground hover:no-underline"
      >
        <IconSearch data-icon="inline-start" />
        Tìm kiếm
        <Kbd className="bg-muted">{`${modKeyLabel} J`}</Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command>
          <CommandInput placeholder="Tìm màn hình quản trị..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            {query ? renderGroups(searchItems) : renderGroups(recommendations)}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
