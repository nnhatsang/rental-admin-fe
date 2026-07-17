'use client';

import * as React from 'react';

import { cn, formatCurrency } from '@/lib/utils';
import { Input } from './input';

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> & {
  value?: number | null;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void;
};

const parseCurrencyValue = (value: string) => {
  const numericText = value.replace(/[^\d]/g, '');
  return numericText ? Number(numericText) : 0;
};

function CurrencyInput({ className, value, onChange, onValueChange, disabled, ...props }: CurrencyInputProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState('');
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const displayValue = isEditing
    ? editingValue
    : formatCurrency(numericValue, { noDecimals: true });

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={displayValue}
      onFocus={(event) => {
        setIsEditing(true);
        setEditingValue(numericValue ? String(numericValue) : '');
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsEditing(false);
        props.onBlur?.(event);
      }}
      onChange={(event) => {
        const numericText = event.target.value.replace(/[^\d]/g, '');
        const nextValue = parseCurrencyValue(numericText);
        setEditingValue(numericText);
        onChange?.(nextValue);
        onValueChange?.(nextValue);
      }}
      className={cn('text-left tabular-nums', className)}
    />
  );
}

export { CurrencyInput };
