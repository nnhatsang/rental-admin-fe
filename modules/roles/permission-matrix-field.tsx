'use client';

import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IPermissionOut } from '../permissions/type';

const BASIC_ACTION_COLUMNS = [
  { key: 'access', label: 'Truy cập' },
  { key: 'create', label: 'Thêm' },
  { key: 'delete', label: 'Xóa' },
  { key: 'update', label: 'Sửa' },
] as const;

type BasicActionKey = (typeof BASIC_ACTION_COLUMNS)[number]['key'];

type PermissionMatrixRow = {
  module: string;
  basic: Partial<Record<BasicActionKey, IPermissionOut[]>>;
  advanced: IPermissionOut[];
  all: IPermissionOut[];
};

interface PermissionMatrixFieldProps {
  emptyText: string;
  permissions: IPermissionOut[];
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}

function getBasicAction(action: string): BasicActionKey | null {
  const normalized = action.toLowerCase();
  if (['access', 'view', 'read', 'list', 'index'].includes(normalized)) return 'access';
  if (['create', 'add'].includes(normalized)) return 'create';
  if (['delete', 'remove'].includes(normalized)) return 'delete';
  if (['update', 'edit'].includes(normalized)) return 'update';
  return null;
}

function humanize(value: string) {
  return value.replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildRows(permissions: IPermissionOut[]) {
  const rows = permissions.reduce<Record<string, PermissionMatrixRow>>((acc, permission) => {
    acc[permission.module] ??= {
      module: permission.module,
      basic: {},
      advanced: [],
      all: [],
    };

    const row = acc[permission.module];
    const basicAction = getBasicAction(permission.action);
    if (basicAction) {
      row.basic[basicAction] ??= [];
      row.basic[basicAction]?.push(permission);
    } else {
      row.advanced.push(permission);
    }
    row.all.push(permission);

    return acc;
  }, {});

  return Object.values(rows).sort((a, b) => a.module.localeCompare(b.module));
}

function getCheckedState(codes: string[], selectedCodes: string[]) {
  if (codes.length === 0) return false;
  const selectedCount = codes.filter((code) => selectedCodes.includes(code)).length;
  if (selectedCount === 0) return false;
  if (selectedCount === codes.length) return true;
  return 'indeterminate';
}

function toggleCodes(selectedCodes: string[], codes: string[], checked: boolean) {
  if (checked) return Array.from(new Set([...selectedCodes, ...codes]));
  return selectedCodes.filter((code) => !codes.includes(code));
}

function AdvancedPermissions({
  permissions,
  value,
  onChange,
  readOnly = false,
}: {
  permissions: IPermissionOut[];
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}) {
  if (permissions.length === 0) return <span className="text-muted-foreground/50">-</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {permissions.map((permission) => (
        <label
          key={permission.code}
          className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-sm border px-2 text-xs text-muted-foreground md:h-7"
          title={permission.code}
        >
          <Checkbox
            checked={value.includes(permission.code)}
            disabled={readOnly}
            aria-label={permission.name || permission.code}
            onCheckedChange={(checked) => onChange(toggleCodes(value, [permission.code], checked === true))}
          />
          <span className="truncate">{humanize(permission.action)}</span>
        </label>
      ))}
    </div>
  );
}

export function PermissionMatrixField({
  emptyText,
  permissions,
  value,
  onChange,
  readOnly = false,
}: PermissionMatrixFieldProps) {
  const rows = React.useMemo(() => buildRows(permissions), [permissions]);
  const allCodes = React.useMemo(() => permissions.map((permission) => permission.code), [permissions]);
  const hasAdvanced = rows.some((row) => row.advanced.length > 0);
  const allChecked = getCheckedState(allCodes, value);
  const handleChange = React.useCallback(
    (next: string[]) => {
      if (readOnly) return;
      onChange(next);
    },
    [onChange, readOnly],
  );

  if (rows.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <>
      <div className="md:hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-3 py-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Chức năng</span>
          <Checkbox
            checked={allChecked}
            disabled={readOnly}
            aria-label="Chọn tất cả quyền"
            onCheckedChange={(checked) => handleChange(toggleCodes(value, allCodes, checked === true))}
          />
        </div>
        <div className="divide-y">
          {rows.map((row) => {
            const rowCodes = row.all.map((permission) => permission.code);
            const rowChecked = getCheckedState(rowCodes, value);

            return (
              <div key={row.module} className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium">{humanize(row.module)}</span>
                  <Checkbox
                    checked={rowChecked}
                    disabled={readOnly}
                    aria-label={`Chọn tất cả quyền ${row.module}`}
                    onCheckedChange={(checked) => handleChange(toggleCodes(value, rowCodes, checked === true))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BASIC_ACTION_COLUMNS.map((action) => {
                    const cellPermissions = row.basic[action.key] ?? [];
                    const cellCodes = cellPermissions.map((permission) => permission.code);
                    const checked = getCheckedState(cellCodes, value);

                    return (
                      <label
                        key={action.key}
                        className="flex h-9 items-center justify-between gap-2 rounded-sm border px-2 text-xs text-muted-foreground"
                      >
                        <span>{action.label}</span>
                        {cellCodes.length > 0 ? (
                          <Checkbox
                            checked={checked}
                            disabled={readOnly}
                            aria-label={`${row.module} - ${action.label}`}
                            onCheckedChange={(next) => handleChange(toggleCodes(value, cellCodes, next === true))}
                          />
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {row.advanced.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Nâng cao</div>
                    <AdvancedPermissions permissions={row.advanced} value={value} onChange={handleChange} readOnly={readOnly} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full caption-bottom border-collapse text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-20 min-w-[260px] border-collapse bg-background pr-4">
                <div className="flex items-center justify-between gap-3">
                  <span>Chức năng</span>
                  <div className="pr-1">
                      <Checkbox
                        checked={allChecked}
                        disabled={readOnly}
                        aria-label="Chọn tất cả quyền"
                        onCheckedChange={(checked) => handleChange(toggleCodes(value, allCodes, checked === true))}
                      />
                  </div>
                </div>
              </TableHead>
              {BASIC_ACTION_COLUMNS.map((action) => (
                <TableHead
                  key={action.key}
                  className="sticky top-0 z-20 w-24 border-b border-r bg-background text-center"
                >
                  {action.label}
                </TableHead>
              ))}
              {hasAdvanced && (
                <TableHead className="sticky top-0 z-20 min-w-[220px] border-b bg-background text-left">
                  Nâng cao
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const rowCodes = row.all.map((permission) => permission.code);
              const rowChecked = getCheckedState(rowCodes, value);

              return (
                <TableRow key={row.module}>
                  <TableCell className="border-r pr-4 font-medium">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">{humanize(row.module)}</span>
                      <div className="pr-1">
                          <Checkbox
                            checked={rowChecked}
                            disabled={readOnly}
                            aria-label={`Chọn tất cả quyền ${row.module}`}
                            onCheckedChange={(checked) => handleChange(toggleCodes(value, rowCodes, checked === true))}
                          />
                      </div>
                    </div>
                  </TableCell>
                  {BASIC_ACTION_COLUMNS.map((action) => {
                    const cellPermissions = row.basic[action.key] ?? [];
                    const cellCodes = cellPermissions.map((permission) => permission.code);
                    const checked = getCheckedState(cellCodes, value);

                    return (
                      <TableCell key={action.key} className="border-r text-center">
                        {cellCodes.length > 0 ? (
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked}
                              disabled={readOnly}
                              aria-label={`${row.module} - ${action.label}`}
                              onCheckedChange={(next) => handleChange(toggleCodes(value, cellCodes, next === true))}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                  {hasAdvanced && (
                    <TableCell>
                      <AdvancedPermissions permissions={row.advanced} value={value} onChange={handleChange} readOnly={readOnly} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </table>
      </div>
    </>
  );
}
