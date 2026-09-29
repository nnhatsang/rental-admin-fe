'use client';

import * as React from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface DataTableRowContextMenuProps {
  children: React.ReactElement;
  content?: React.ReactNode;
}

/**
 * Bọc trực tiếp một TableRow để không thêm phần tử DOM trung gian vào tbody.
 * Khi không có content, trả lại row nguyên bản để các table cũ không đổi hành vi.
 */
export function DataTableRowContextMenu({ children, content }: DataTableRowContextMenuProps) {
  if (!content) return children;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-60">{content}</ContextMenuContent>
    </ContextMenu>
  );
}