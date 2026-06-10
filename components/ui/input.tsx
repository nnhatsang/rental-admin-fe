import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

const inputVariants = cva(
  'bg-input/40 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-7 rounded-md border px-2 py-0.5 text-sm transition-colors file:h-6 file:text-xs/relaxed file:font-medium focus-visible:ring-[2px] aria-invalid:ring-[2px] md:text-xs/relaxed file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8',
        md: 'h-9',
        lg: 'h-11',
      },
      variant: {
        default: ' focus-visible:ring-0 focus-visible:ring-offset-0 ',
      },
    },
    defaultVariants: {
      size: 'lg',
      variant: 'default',
    },
  },
);

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

function Input({ className, variant = 'default', asChild = false, size = 'lg', ...props }: InputProps) {
  const Comp = asChild ? Slot.Root : 'input';

  return (
    <Comp
      data-slot="input"
      data-variant={variant}
      data-size={size}
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input };
