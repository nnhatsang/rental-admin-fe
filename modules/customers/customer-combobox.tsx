'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { useGetCustomers } from './hooks/use-get-customers';
import { CustomerSortBy, CustomerStatus, type ICustomerOut } from './type';
import { useCallback, useMemo, useRef, useState } from 'react';

export type CustomerOption = Pick<ICustomerOut, 'id' | 'name' | 'phone'>;

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
      status: CustomerStatus.Active,
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

            return (
              <ComboboxItem key={customer.id} value={customer.id}>
                <Item size="xs" className="p-0">
                  <ItemContent className={classNameContent}>
                    {customer.email ? (
                      <>
                        <ItemTitle className="truncate text-sm font-medium">{`${customer.name}  `}</ItemTitle>
                        <ItemTitle className="truncate text-sm font-medium">{`${customer.email} `}</ItemTitle>
                      </>
                    ) : (
                      <ItemTitle className="truncate text-sm font-medium">{`${customer.name} `}</ItemTitle>
                    )}

                    <ItemDescription className="text-muted-foreground mt-1 text-xs">
                      {customer.phone ?? 'Không có số điện thoại'}
                    </ItemDescription>
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
