import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { NavGroup, NavMainItem } from '@/components/layout/types';
import { canAccessPermissions } from '@/utils/consts/sidebar.const';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getInitials = (str: string): string => {
  if (typeof str !== 'string' || !str.trim()) return '?';

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = 'VND', locale = 'vi-VN', minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}
export const LOCALE = {
  dateFormats: {
    datetime: 'dd/MM/yyyy HH:mm',
    datetimeFull: "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy, 'lúc' HH:mm",
    datetimeLong: "dd/MM/yyyy 'lúc' HH:mm",
    long: "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy",
    medium: 'dd MMM yyyy',
    short: 'dd/MM/yyyy',
    shortDateTime: 'dd/MM HH:mm',
    time: 'HH:mm',
  },
} as const;

export const formatDate = (date: Date | string, formatType: keyof typeof LOCALE.dateFormats = 'datetime'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, LOCALE.dateFormats[formatType], { locale: vi });
};

export const filterSidebarItemsByPermissions = (items: NavGroup[], userPermissions: string[]): NavGroup[] => {
  return items
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          const subItems = item.subItems?.filter((subItem) =>
            canAccessPermissions(subItem.requiredPermissions, userPermissions),
          );
          const hasVisibleSubItems = Boolean(subItems?.length);

          if (!canAccessPermissions(item.requiredPermissions, userPermissions) && !hasVisibleSubItems) {
            return null;
          }

          return {
            ...item,
            ...(subItems ? { subItems } : {}),
          };
        })
        .filter((item): item is NavMainItem => Boolean(item));

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
};

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export const modKeyLabel = isMac ? '⌘' : 'Ctrl';

export function getAvatarColor(name: string): string {
  // const AVATAR_COLORS = [
  //   '#7C3AED',
  //   '#2563EB',
  //   '#059669',
  //   '#EA580C',
  //   '#DC2626',
  //   '#0F766E',
  //   '#4338CA',
  //   '#BE185D',
  //   '#0369A1',
  //   '#4B5563',
  // ];

  const AVATAR_COLORS = [
    '[&_[data-slot=avatar-fallback]]:bg-amber-100 [&_[data-slot=avatar-fallback]]:text-amber-700 after:border-amber-200 dark:[&_[data-slot=avatar-fallback]]:bg-amber-500/15 dark:[&_[data-slot=avatar-fallback]]:text-amber-300 dark:after:border-amber-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-orange-100 [&_[data-slot=avatar-fallback]]:text-orange-700 after:border-orange-200 dark:[&_[data-slot=avatar-fallback]]:bg-orange-500/15 dark:[&_[data-slot=avatar-fallback]]:text-orange-300 dark:after:border-orange-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-rose-100 [&_[data-slot=avatar-fallback]]:text-rose-700 after:border-rose-200 dark:[&_[data-slot=avatar-fallback]]:bg-rose-500/15 dark:[&_[data-slot=avatar-fallback]]:text-rose-300 dark:after:border-rose-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-pink-100 [&_[data-slot=avatar-fallback]]:text-pink-700 after:border-pink-200 dark:[&_[data-slot=avatar-fallback]]:bg-pink-500/15 dark:[&_[data-slot=avatar-fallback]]:text-pink-300 dark:after:border-pink-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-fuchsia-100 [&_[data-slot=avatar-fallback]]:text-fuchsia-700 after:border-fuchsia-200 dark:[&_[data-slot=avatar-fallback]]:bg-fuchsia-500/15 dark:[&_[data-slot=avatar-fallback]]:text-fuchsia-300 dark:after:border-fuchsia-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-purple-100 [&_[data-slot=avatar-fallback]]:text-purple-700 after:border-purple-200 dark:[&_[data-slot=avatar-fallback]]:bg-purple-500/15 dark:[&_[data-slot=avatar-fallback]]:text-purple-300 dark:after:border-purple-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-violet-100 [&_[data-slot=avatar-fallback]]:text-violet-700 after:border-violet-200 dark:[&_[data-slot=avatar-fallback]]:bg-violet-500/15 dark:[&_[data-slot=avatar-fallback]]:text-violet-300 dark:after:border-violet-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-indigo-100 [&_[data-slot=avatar-fallback]]:text-indigo-700 after:border-indigo-200 dark:[&_[data-slot=avatar-fallback]]:bg-indigo-500/15 dark:[&_[data-slot=avatar-fallback]]:text-indigo-300 dark:after:border-indigo-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-sky-100 [&_[data-slot=avatar-fallback]]:text-sky-700 after:border-sky-200 dark:[&_[data-slot=avatar-fallback]]:bg-sky-500/15 dark:[&_[data-slot=avatar-fallback]]:text-sky-300 dark:after:border-sky-500/20',
    '[&_[data-slot=avatar-fallback]]:bg-emerald-100 [&_[data-slot=avatar-fallback]]:text-emerald-700 after:border-emerald-200 dark:[&_[data-slot=avatar-fallback]]:bg-emerald-500/15 dark:[&_[data-slot=avatar-fallback]]:text-emerald-300 dark:after:border-emerald-500/20',
  ];

  if (!name.trim()) return AVATAR_COLORS[0];

  const hash = [...name.toLowerCase()].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
