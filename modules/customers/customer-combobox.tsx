'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { useGetCustomers } from './hooks/use-get-customers';
import { CustomerSortBy, CustomerStatus, type ICustomerOut } from './type';
import { customerStatusConfig } from './display-config';
import { useCallback, useMemo, useRef, useState } from 'react';
import { UserAvatar } from '@/components/ui/user-avatar';

export type CustomerOption = Pick<ICustomerOut, 'id' | 'name' | 'phone'> &
  Partial<Pick<ICustomerOut, 'email' | 'socialContact' | 'status'>>;

export type CustomerComboboxProps = {
  value?: string;
  onChange?: (value: string) => void;
  onCustomerChange?: (customer: CustomerOption | null) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
  placeholder?: string;
  selectedCustomer?: CustomerOption | null;
  portalContainer?: HTMLElement | null;
  fetchEnabled?: boolean;
  classNameContent?: string;
  /** Show inactive/blocked customers as disabled options with their status. */
  includeUnavailable?: boolean;
};

const customerLabel = (customer: Pick<ICustomerOut, 'name' | 'phone'>) =>
  customer.phone ? `${customer.name} · ${customer.phone}` : customer.name;

export function CustomerCombobox({
  value,
  onChange,
  onCustomerChange,
  disabled,
  ariaInvalid,
  className,
  placeholder = 'Tìm theo tên hoặc số điện thoại',
  selectedCustomer,
  portalContainer,
  fetchEnabled = true,
  classNameContent,
  includeUnavailable = false,
}: CustomerComboboxProps) {
  const ignoreNextInputChangeRef = useRef(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [localSelectedCustomer, setLocalSelectedCustomer] = useState<CustomerOption | null>(null);
  const shouldFetchCustomers = fetchEnabled && !disabled;
  const customerQuery = useGetCustomers(
    {
      page: 1,
      perPage: 20,
      search: debouncedSearch || undefined,
      // Keep the initial list focused on usable customers. Once an admin
      // searches, include unavailable matches so the status badge explains
      // why a blocked/inactive customer cannot be selected.
      status: includeUnavailable && debouncedSearch ? undefined : CustomerStatus.Active,
      sort: 'asc',
      sortBy: CustomerSortBy.NAME,
    },
    shouldFetchCustomers,
  );

  const customers = useMemo(() => {
    const items = customerQuery.data?.items ?? [];
    const visibleSelectedCustomer = selectedCustomer ?? localSelectedCustomer;

    if (!visibleSelectedCustomer || items.some((item) => item.id === visibleSelectedCustomer.id)) {
      return items;
    }

    return [visibleSelectedCustomer as ICustomerOut, ...items];
  }, [customerQuery.data?.items, localSelectedCustomer, selectedCustomer]);

  const customerById = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);
  const customerIds = useMemo(() => customers.map((customer) => customer.id), [customers]);
  const selectedValue = value && customerById.has(value) ? value : null;

  const onSearchChange = useCallback((nextSearch: string | undefined) => {
    if (ignoreNextInputChangeRef.current) return;
    setSearch((nextSearch ?? '').trim());
  }, []);

  const clearSearchAfterSelect = useCallback(() => {
    ignoreNextInputChangeRef.current = true;
    setSearch('');
    window.setTimeout(() => {
      ignoreNextInputChangeRef.current = false;
    }, 0);
  }, []);

  const itemToStringLabel = useCallback(
    (customerId: string) => {
      const customer = customerById.get(customerId);
      return customer ? customerLabel(customer) : '';
    },
    [customerById],
  );

  return (
    <Combobox
      items={customerIds}
      value={selectedValue}
      onValueChange={(nextValue) => {
        const nextCustomer = nextValue ? (customerById.get(nextValue) ?? null) : null;
        if (nextCustomer && nextCustomer.status && nextCustomer.status !== CustomerStatus.Active) return;
        setLocalSelectedCustomer(nextCustomer);
        clearSearchAfterSelect();
        onCustomerChange?.(nextCustomer);
        onChange?.(nextValue ?? '');
      }}
      onInputValueChange={onSearchChange}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={(customerId) => customerId}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxInput
        className={cn('w-full', className)}
        placeholder={placeholder}
        disabled={disabled}
        showClear={!disabled && Boolean(value)}
        aria-invalid={ariaInvalid}
      />
      <ComboboxContent portalContainer={portalContainer}>
        <ComboboxEmpty>
          {customerQuery.isFetching ? 'Đang tìm khách hàng...' : 'Không tìm thấy khách hàng.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(customerId: string) => {
            const customer = customerById.get(customerId);
            if (!customer) return null;
            const statusConfig = customer.status ? customerStatusConfig[customer.status] : null;
            const StatusIcon = statusConfig?.icon;

            return (
              <ComboboxItem
                key={customer.id}
                value={customer.id}
                disabled={Boolean(customer.status && customer.status !== CustomerStatus.Active)}
              >
                <Item size="xs" className="min-w-0 p-0">
                  <UserAvatar name={customer.name} src={customer.avatar} className="font-medium" />
                  <ItemContent className={cn('min-w-0 gap-1', classNameContent)}>
                    <div className="flex min-w-0 items-center gap-2">
                      <ItemTitle className="min-w-0 flex-1 truncate text-sm font-medium">{customer.name}</ItemTitle>
                      {statusConfig ? (
                        <Badge variant="outline" className={cn('shrink-0 gap-1 text-[10px]', statusConfig.className)}>
                          {StatusIcon ? <StatusIcon data-icon="inline-start" aria-hidden="true" /> : null}
                          {statusConfig.label}
                        </Badge>
                      ) : null}
                    </div>
                    <ItemDescription className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span>{customer.phone ?? 'Không có số điện thoại'}</span>
                      {customer.email ? <span className="max-w-52 truncate">· {customer.email}</span> : null}
                    </ItemDescription>
                    {includeUnavailable && customer.status !== CustomerStatus.Active ? (
                      <p className="text-[11px] text-destructive">Không thể chọn khách hàng này cho đơn thuê</p>
                    ) : null}
                  </ItemContent>
                </Item>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
