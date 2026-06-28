import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { NavGroup, NavMainItem } from '@/components/layout/types';
import { PermissionCode } from '@/utils/consts/rbac.const';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const { currency = 'vi-VN', locale = 'đ', minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

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
    rentalSchedule: 'HH:mm EEEE dd/MM',
    short: 'dd/MM/yyyy',
    shortDateTime: 'dd/MM HH:mm',
    time: 'HH:mm',
  },
} as const;

export const formatDate = (date: Date | string, formatType: keyof typeof LOCALE.dateFormats = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, LOCALE.dateFormats[formatType], { locale: vi });
};

const canAccess = (requiredPermissions: PermissionCode[] | undefined, userPermissions: string[]) => {
  if (!requiredPermissions?.length) return true;

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

export const filterSidebarItemsByPermissions = (items: NavGroup[], userPermissions: string[]): NavGroup[] => {
  return items
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          const subItems = item.subItems?.filter((subItem) => canAccess(subItem.requiredPermissions, userPermissions));
          const hasVisibleSubItems = Boolean(subItems?.length);

          if (!canAccess(item.requiredPermissions, userPermissions) && !hasVisibleSubItems) {
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
  const AVATAR_COLORS = [
    '#D8B4FE', // Purple
    '#BFDBFE', // Blue
    '#BBF7D0', // Green
    '#FDE68A', // Yellow
    '#FECACA', // Red
    '#A7F3D0', // Teal
    '#C7D2FE', // Indigo
    '#FBCFE8', // Pink
    '#BAE6FD', // Sky
  ];

  if (!name.trim()) return '#CBD5E1';

  const hash = [...name.toLowerCase()].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
